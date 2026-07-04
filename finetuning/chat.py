import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

print("========================================")
print("  DANG TAI MO HINH AI DA FINE-TUNE      ")
print("========================================")

base_model_name = "Qwen/Qwen2.5-0.5B-Instruct"
adapter_dir = "finetuned_model"

print("1. Dang tai Tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(adapter_dir)

print("2. Dang tai Mo hinh goc (Base Model)...")
model = AutoModelForCausalLM.from_pretrained(
    base_model_name,
    torch_dtype=torch.float16,
    device_map="auto"
)

print("3. Dang ghep noi bo nao da Fine-tune (LoRA Adapter)...")
model = PeftModel.from_pretrained(model, adapter_dir)

print("\n[HOAN THANH] AI da san sang tro chuyen!\n")

while True:
    user_input = input("Ban: ")
    if user_input.lower() in ["exit", "quit", "thoat"]:
        break
        
    text = f"<|im_start|>user\n{user_input}<|im_end|>\n<|im_start|>assistant\n"
    
    model_inputs = tokenizer([text], return_tensors="pt").to(model.device)
    
    generated_ids = model.generate(
        **model_inputs,
        max_new_tokens=512,
        do_sample=True,
        temperature=0.7,
        top_p=0.9
    )
    
    generated_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
    ]
    
    response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
    print(f"AI: {response}\n")
