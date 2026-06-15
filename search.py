import json

log_path = r"C:\Users\HP\.gemini\antigravity\brain\ce0e4da7-f9f5-421c-906a-55f71d4e7e0c\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for line in lines[-1000:]: # search last 1000 steps
    try:
        data = json.loads(line)
        content = data.get("content", "")
        if "Marvel Logo Tee" in content or "Naruto" in content or "ReplacementChunks" in content:
            if "Marvel" in content:
                print(f"Found in step {data.get('step_index')}")
                if len(content) > 1000:
                    print(content[:500] + " ... " + content[-500:])
                else:
                    print(content)
    except:
        pass
