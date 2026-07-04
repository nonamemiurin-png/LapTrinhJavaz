import torch
import sys
from datasets import load_dataset
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, BitsAndBytesConfig
from trl import SFTTrainer, SFTConfig

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

# Cấu hình Model & Tokenizer
model_name = "Qwen/Qwen2.5-0.5B-Instruct"
dataset_name = "data/training_data.jsonl"

print(f"Loading model: {model_name}")
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16
)

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    device_map="auto"
)
model = prepare_model_for_kbit_training(model)

# Cấu hình LoRA (Parameter-Efficient Fine-Tuning)
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)
model = get_peft_model(model, lora_config)

# Load Dataset
dataset = load_dataset("json", data_files={"train": dataset_name})

# Cấu hình Training
training_args = SFTConfig(
    output_dir="./results",
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    num_train_epochs=15,
    logging_steps=10,
    optim="paged_adamw_8bit",
    save_strategy="epoch",
    dataset_text_field="text",
    max_length=512
)

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset["train"],
    args=training_args
)

print("Bắt đầu quá trình Fine-Tuning...")
trainer.train()

# Lưu weights đã được fine-tune
model.save_pretrained("./finetuned_model")
tokenizer.save_pretrained("./finetuned_model")
print("Fine-tuning hoàn tất! Weights được lưu tại ./finetuned_model")
