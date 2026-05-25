import json
from http.server import BaseHTTPRequestHandler, HTTPServer

# "Banco de dados" em memória
pessoas = [
    {"id": 1, "nome": "João"},
    {"id": 2, "nome": "Maria"}
]

class SimpleAPI(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()

    # GET
    def do_GET(self):
        if self.path == "/pessoas":
            self._set_headers()
            self.wfile.write(json.dumps(pessoas).encode())
        elif self.path.startswith("/pessoas/"):
            try:
                pessoa_id = int(self.path.split("/")[-1])
                pessoa = next((p for p in pessoas if p["id"] == pessoa_id), None)
                if pessoa:
                    self._set_headers()
                    self.wfile.write(json.dumps(pessoa).encode())
                else:
                    self._set_headers(404)
                    self.wfile.write(json.dumps({"erro": "Pessoa não encontrada"}).encode())
            except ValueError:
                self._set_headers(400)
                self.wfile.write(json.dumps({"erro": "ID inválido"}).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"erro": "Rota não encontrada"}).encode())

    # POST
    def do_POST(self):
        if self.path == "/pessoas":
            content_length = int(self.headers["Content-Length"])
            post_data = self.rfile.read(content_length)
            dados = json.loads(post_data.decode())

            if "nome" not in dados:
                self._set_headers(400)
                self.wfile.write(json.dumps({"erro": "Nome é obrigatório"}).encode())
                return

            nova_pessoa = {
                "id": (pessoas[-1]["id"] + 1) if pessoas else 1,
                "nome": dados["nome"]
            }
            pessoas.append(nova_pessoa)

            self._set_headers(201)
            self.wfile.write(json.dumps(nova_pessoa).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"erro": "Rota não encontrada"}).encode())

    # PUT
    def do_PUT(self):
        if self.path.startswith("/pessoas/"):
            try:
                pessoa_id = int(self.path.split("/")[-1])
                pessoa = next((p for p in pessoas if p["id"] == pessoa_id), None)

                if not pessoa:
                    self._set_headers(404)
                    self.wfile.write(json.dumps({"erro": "Pessoa não encontrada"}).encode())
                    return

                content_length = int(self.headers["Content-Length"])
                put_data = self.rfile.read(content_length)
                dados = json.loads(put_data.decode())

                pessoa["nome"] = dados.get("nome", pessoa["nome"])

                self._set_headers(200)
                self.wfile.write(json.dumps(pessoa).encode())
            except ValueError:
                self._set_headers(400)
                self.wfile.write(json.dumps({"erro": "ID inválido"}).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"erro": "Rota não encontrada"}).encode())

    # DELETE
    def do_DELETE(self):
        if self.path.startswith("/pessoas/"):
            try:
                pessoa_id = int(self.path.split("/")[-1])
                pessoa = next((p for p in pessoas if p["id"] == pessoa_id), None)

                if not pessoa:
                    self._set_headers(404)
                    self.wfile.write(json.dumps({"erro": "Pessoa não encontrada"}).encode())
                    return

                pessoas.remove(pessoa)

                self._set_headers(200)
                self.wfile.write(json.dumps({"msg": "Pessoa removida com sucesso"}).encode())
            except ValueError:
                self._set_headers(400)
                self.wfile.write(json.dumps({"erro": "ID inválido"}).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"erro": "Rota não encontrada"}).encode())


def run(server_class=HTTPServer, handler_class=SimpleAPI, port=5000):
    server_address = ("", port)
    httpd = server_class(server_address, handler_class)
    print(f"Servidor rodando em http://127.0.0.1:{port}")
    httpd.serve_forever()


if __name__ == "__main__":
    run()
