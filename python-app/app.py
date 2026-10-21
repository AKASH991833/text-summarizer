"""Briefly - neural text summarization (Gradio).
Run: python app.py
Model: Falconsai/text_summarization (T5-small fine-tuned for summarization), CPU.
"""
import os
import torch
import gradio as gr
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

MODEL = "Falconsai/text_summarization"
tok = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL)
model.eval()

def summarize(text, max_len, min_len, style):
    if len(text.strip().split()) < 30:
        return "", "Please paste at least ~30 words; summarizing shorter text adds nothing."
    style_note = {"Neutral": "", "Bullet-like structure": ", summarize with clear separate points",
                  "Very short headline": ", summarize in one short line"}[style]
    inp = tok("summarize: " + text + style_note, return_tensors="pt",
              truncation=True, max_length=1024)
    with torch.no_grad():
        out = model.generate(**inp, max_length=int(max_len), min_length=int(min_len),
                             num_beams=4, length_penalty=2.0, early_stopping=True,
                             no_repeat_ngram_size=3)
    summary = tok.decode(out[0], skip_special_tokens=True).strip()
    in_w, out_w = len(text.split()), len(summary.split())
    ratio = f"Compressed {in_w} words to {out_w} ({max(1, round(100*out_w/in_w))}% of original)."
    return summary, ratio

SAMPLE = ("Artificial intelligence has moved from research labs into everyday products at "
          "extraordinary speed. Translation apps, photo search, spam filters and navigation "
          "all quietly use machine learning models trained on vast datasets. The newest wave, "
          "large language models, can draft text, write code and answer questions in natural "
          "language. This has created excitement about productivity gains in fields like "
          "education, medicine and software development. It has also raised hard questions: "
          "models sometimes state falsehoods confidently, they reflect biases in their "
          "training data, and their energy use is significant. Researchers are working on "
          "smaller, more efficient models that can run on ordinary hardware, better methods "
          "for checking facts, and clearer rules for transparency. Governments in several "
          "countries are drafting regulations, while companies race to integrate AI into "
          "their products. Most experts agree the technology will keep improving quickly, "
          "and that the key challenge for the next decade is making it reliable, fair and "
          "useful for everyone rather than a privileged few.")

with gr.Blocks(title="Briefly - Text Summarizer") as demo:
    gr.Markdown("# 📄 Briefly\nPaste a long article, get the gist. A T5 model fine-tuned for "
                "abstractive summarization, running on CPU. **Honest limits:** abstractive "
                "summaries can drop nuances or, rarely, misstate a detail - always check "
                "the summary against the source for anything that matters. Best on "
                "English news-style prose of 100-1500 words.")
    with gr.Row():
        inp = gr.Textbox(lines=12, label="Long text", value=SAMPLE)
        out = gr.Textbox(lines=6, label="Summary")
    stats = gr.Markdown("")
    with gr.Row():
        maxl = gr.Slider(40, 300, 130, step=10, label="Max summary length (tokens)")
        minl = gr.Slider(10, 120, 40, step=5, label="Min summary length (tokens)")
        style = gr.Radio(["Neutral","Bullet-like structure","Very short headline"],
                         value="Neutral", label="Style")
    btn = gr.Button("Summarize", variant="primary")
    btn.click(summarize, [inp, maxl, minl, style], [out, stats])
    demo.load(summarize, [inp, maxl, minl, style], [out, stats])

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=int(os.environ.get("PORT", 7860)))
