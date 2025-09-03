# Vast.AI GPU Deployment Guide

Quick reference for deploying code on Vast.AI GPU instances.

## Prerequisites

```bash
# Install Vast.AI CLI
pip install vastai

# Set API key
vastai set api-key YOUR_API_KEY
```

## Common Deployment Patterns

### 1. Find Optimal GPU Instance

```bash
# Cost-optimized training
vastai search offers 'reliability >= 0.95 gpu_ram >= 12' -o 'dph_total'

# Performance training (A100)
vastai search offers 'gpu_name=RTX_A100 reliability >= 0.98' -o 'dlperf/$'

# Budget inference
vastai search offers 'gpu_ram >= 8 dph_total <= 1.0' -o 'dph_total'
```

### 2. Deploy GitHub Repository

```bash
# PyTorch Training
vastai create instance OFFER_ID \
  --image pytorch/pytorch:2.1.0-cuda12.1-cudnn8-devel \
  --disk 50 \
  --ssh \
  --onstart-cmd "git clone https://github.com/user/repo /workspace && cd /workspace && pip install -r requirements.txt && python train.py"

# Jupyter Research
vastai create instance OFFER_ID \
  --image jupyter/tensorflow-notebook:latest \
  --disk 30 \
  --ssh \
  --jupyter \
  --onstart-cmd "git clone https://github.com/user/repo /home/jovyan/work/"
```

### 3. Common Docker Images

| Framework    | Image                                         | Use Case |
| ------------ | --------------------------------------------- | -------- |
| PyTorch      | `pytorch/pytorch:2.1.0-cuda12.1-cudnn8-devel` | Training |
| TensorFlow   | `tensorflow/tensorflow:2.14.0-gpu`            | Training |
| Hugging Face | `huggingface/transformers-pytorch-gpu:4.35.0` | LLM work |
| Jupyter      | `jupyter/tensorflow-notebook:latest`          | Research |

### 4. Instance Management

```bash
# List instances
vastai show instances

# Connect via SSH
vastai ssh-url INSTANCE_ID

# Stop instance
vastai stop instance INSTANCE_ID

# Monitor costs
vastai show instances --raw | jq '.[].cur_state.cost_per_hr'
```

## Example: Deploy MNIST Training

```bash
# 1. Find cheap GPU
OFFER_ID=$(vastai search offers 'reliability >= 0.95 gpu_ram >= 8' -o 'dph_total' --raw | jq -r '.[0].id')

# 2. Deploy
vastai create instance $OFFER_ID \
  --image pytorch/pytorch:latest \
  --disk 25 \
  --ssh \
  --onstart-cmd "git clone https://github.com/pytorch/examples /workspace && cd /workspace/mnist && pip install -r requirements.txt && python main.py --epochs 5"
```

## Cost Optimization Tips

- Use `reliability >= 0.95` for stable instances
- Start with smaller disk sizes (25-50GB)
- Monitor with `vastai show instances` regularly
- Set up auto-stop scripts for long training runs
- Use spot instances for fault-tolerant workloads

## Troubleshooting

**Image pull timeout:**

```bash
# Use smaller base images
--image python:3.9-slim
```

**Out of memory:**

```bash
# Search for higher GPU RAM
vastai search offers 'gpu_ram >= 24'
```

**High costs:**

```bash
# Add budget limit to search
vastai search offers 'dph_total <= 2.0'
```
