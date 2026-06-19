import http.server
import json
import subprocess
import os
import sys
from urllib.parse import urlparse, parse_qs

SECRET = os.environ.get("HERMES_API_SECRET", "psicoflow-hermes-2026")
HERMES_BIN = os.path.expanduser("~/hermes-agent/hermes")
VENV_PYTHON = os.path.expanduser("~/hermes-agent/.venv/bin/python3")

FREE_MODELS = [
    "nvidia/nemotron-3-super-120b-a12b:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "openrouter/free",
]

def call_hermes(prompt, model_index=0):
    model = FREE_MODELS[model_index % len(FREE_MODELS)]
    cmd = [
        VENV_PYTHON, HERMES_BIN, "run", "-m", model,
        "--no-stream", "-p", prompt,
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode == 0:
            return {"success": True, "response": result.stdout, "model": model}
        # Check if it's a rate limit error
        if "429" in result.stderr or "rate limit" in result.stderr.lower():
            return {"success": False, "error": "rate_limited", "model": model}
        return {"success": False, "error": result.stderr, "model": model}
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "timeout", "model": model}
    except Exception as e:
        return {"success": False, "error": str(e), "model": model}

class Handler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # Auth check
        auth = self.headers.get("Authorization", "")
        if auth != f"Bearer {SECRET}":
            self.send_error(401, "Unauthorized")
            return

        content_len = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(content_len)) if content_len else {}

        if path == "/api/hermes/gerar-soap":
            keywords = body.get("keywords", "")
            prompt = f"""Você é um assistente de prontuário psicológico. 
Gere um registro SOAP (Subjetivo, Objetivo, Avaliação, Plano) completo e profissional 
em português brasileiro com base nas seguintes palavras-chave da sessão:

{keywords}

Formato:
**Subjetivo:** (relato do paciente)
**Objetivo:** (observações do psicólogo)  
**Avaliação:** (análise clínica)
**Plano:** (próximos passos)"""

            for i in range(len(FREE_MODELS) * 2):  # Try each model twice
                result = call_hermes(prompt, i)
                if result["success"]:
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps(result).encode())
                    return
                if result["error"] != "rate_limited":
                    break  # Non-rate-limit error, give up

            # All models failed
            self.send_response(503)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": False, "error": "Todos os modelos estão temporariamente indisponíveis"
            }).encode())

        elif path == "/api/hermes/analisar-diario":
            entries = body.get("entries", "")
            prompt = f"""Analise as seguintes entradas do diário emocional de um paciente 
e identifique padrões, tendências de humor, possíveis gatilhos e sugestões clínicas:

{entries}

Forneça uma análise em português brasileiro com:
- Padrões identificados
- Tendência geral de humor
- Possíveis gatilhos
- Recomendações clínicas"""

            for i in range(len(FREE_MODELS) * 2):
                result = call_hermes(prompt, i)
                if result["success"]:
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps(result).encode())
                    return
                if result["error"] != "rate_limited":
                    break

            self.send_response(503)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": False, "error": "Todos os modelos estão temporariamente indisponíveis"
            }).encode())

        elif path == "/api/hermes/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode())

        else:
            self.send_error(404, "Not found")

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/hermes/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode())
        else:
            self.send_error(404)

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8899
    server = http.server.HTTPServer(("0.0.0.0", port), Handler)
    print(f"Hermes API server running on port {port}")
    server.serve_forever()
