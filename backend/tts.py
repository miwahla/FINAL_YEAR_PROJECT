import torch
import sys
import json
from transformers import VitsModel, VitsTokenizer
import scipy.io.wavfile
import os

def generate_tts(text, language, output_path):
    """
    Generate TTS audio using Hugging Face models
    Returns the path abc to the generated WAV file
    """
    try:
        # Select model based on language
        if language == "en":
            model_id = "facebook/mms-tts-eng"
        elif language == "ur":
            model_id = "suhaibrashid17/MMS_TTS_Urdu_3"
        else:
            raise ValueError(f"Unsupported language: {language}")

        print(f"Loading model: {model_id}")

        # Load model and tokenizer
        tokenizer = VitsTokenizer.from_pretrained(model_id)
        model = VitsModel.from_pretrained(model_id)

        print(f"Tokenizing text...")

        # Tokenize input
        inputs = tokenizer(text, return_tensors="pt")

        print(f"Generating speech...")

        # Generate speech
        with torch.no_grad():
            output = model(**inputs).waveform

        # Get sampling rate
        sampling_rate = model.config.sampling_rate

        print(f"Saving audio to {output_path} (sampling rate: {sampling_rate})")

        # Save as WAV
        audio_data = output[0].cpu().numpy()
        scipy.io.wavfile.write(output_path, rate=sampling_rate, data=audio_data)

        print(f"Success! Audio saved to {output_path}")

        return {
            "success": True,
            "path": output_path,
            "sampling_rate": sampling_rate,
            "text_length": len(text)
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    # Read arguments from command line
    if len(sys.argv) < 4:
        print("Usage: python tts.py <text> <language> <output_path>")
        sys.exit(1)

    text = sys.argv[1]
    language = sys.argv[2]
    output_path = sys.argv[3]

    result = generate_tts(text, language, output_path)
    print(json.dumps(result))
