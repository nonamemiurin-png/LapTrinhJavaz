import torch
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import uvicorn
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Local Fine-Tuned AI API")

# Global variables for model and tokenizer
tokenizer = None
model = None

base_model_name = "Qwen/Qwen2.5-0.5B-Instruct"
adapter_dir = "finetuned_model"

@app.on_event("startup")
async def load_model():
    global tokenizer, model
    logger.info("========================================")
    logger.info("  DANG TAI MO HINH AI DA FINE-TUNE      ")
    logger.info("========================================")
    
    try:
        logger.info("1. Dang tai Tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(adapter_dir)
        
        logger.info("2. Dang tai Mo hinh goc (Base Model)...")
        # device_map="auto" can offload layers to the meta device on CPU-only
        # machines. PEFT then cannot attach LoRA weights to embed_tokens. Keep
        # the small 0.5B model fully on CPU for a reliable local demo.
        if torch.cuda.is_available():
            base_model = AutoModelForCausalLM.from_pretrained(
                base_model_name,
                dtype=torch.float16,
                device_map="auto"
            )
        else:
            base_model = AutoModelForCausalLM.from_pretrained(
                base_model_name,
                dtype=torch.float32,
                low_cpu_mem_usage=False
            )
        
        logger.info("3. Dang ghep noi bo nao da Fine-tune (LoRA Adapter)...")
        model = PeftModel.from_pretrained(base_model, adapter_dir)
        
        logger.info("\n[HOAN THANH] AI da san sang phuc vu API tren cong 8001!\n")
    except Exception:
        # Fail startup instead of exposing an API that always returns a
        # misleading HTTP 200 with "model is not loaded".
        logger.exception("Loi khi tai mo hinh")
        raise

class GenerateRequest(BaseModel):
    model: str = "llama3"
    prompt: str
    stream: bool = False

@app.get("/health")
async def health():
    return {"status": "UP" if model is not None and tokenizer is not None else "LOADING"}

@app.post("/api/generate")
async def generate(request: GenerateRequest):
    if model is None or tokenizer is None:
        return {"response": "Mo hinh chua duoc tai xong. Vui long doi giay lat."}
        
    try:
        user_input = request.prompt
        text = f"<|im_start|>user\n{user_input}<|im_end|>\n<|im_start|>assistant\n"
        
        model_inputs = tokenizer([text], return_tensors="pt").to(model.device)
        
        generated_ids = model.generate(
            **model_inputs,
            max_new_tokens=512,
            do_sample=False,
            repetition_penalty=1.1
        )
        
        generated_ids = [
            output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
        ]
        
        response_text = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
        return {"response": response_text}
    except Exception as e:
        logger.error(f"Loi khi xu ly request: {e}")
        return {"response": f"Co loi xay ra trong qua trinh xu ly: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run("api_server:app", host="0.0.0.0", port=8001, reload=False)
