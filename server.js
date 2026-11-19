
const express = require("express");
const { MongoClient } = require("mongodb");
const { randomUUID } = require("crypto");

const app = express();
app.use(express.json());

let colecaoPromise;

async function obterClientes() {
  if (!colecaoPromise) {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI nao configurada");
    }

    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 7000
    });

    colecaoPromise = client.connect()
      .then(() => client.db("smartbank_api").collection("clientes"))
      .catch((erro) => {
        colecaoPromise = null;
        throw erro;
      });
  }

  return colecaoPromise;
}

app.get("/", (req, res) => {
  res.status(200).send("API de clientes funcionando.");
});

app.get("/clientes", async (req, res) => {
  try {
    const clientes = await obterClientes();
    const lista = await clientes.find({}).toArray();
    res.status(200).json(lista);
  } catch (erro) {
    console.error("GET /clientes:", erro.message);
    res.status(503).json({ erro: "Erro ao consultar clientes." });
  }
});

app.post("/clientes", async (req, res) => {
  const { nome, sobreNome } = req.body || {};

  if (!nome || !sobreNome) {
    return res.status(400).json({ erro: "Informe nome e sobreNome." });
  }

  try {
    const clientes = await obterClientes();
    await clientes.insertOne({
      _id: randomUUID(),
      nome,
      sobreNome
    });

    res.status(200).end();
  } catch (erro) {
    console.error("POST /clientes:", erro.message);
    res.status(503).json({ erro: "Erro ao cadastrar cliente." });
  }
});

app.put("/clientes", async (req, res) => {
  const { _id, nome, sobreNome } = req.body || {};

  if (!_id) {
    return res.status(400).json({ erro: "Informe o _id." });
  }

  const dados = {};
  if (nome !== undefined) dados.nome = nome;
  if (sobreNome !== undefined) dados.sobreNome = sobreNome;

  if (Object.keys(dados).length === 0) {
    return res.status(400).json({ erro: "Informe os dados para alterar." });
  }

  try {
    const clientes = await obterClientes();
    const alterado = await clientes.findOneAndUpdate(
      { _id },
      { $set: dados },
      { returnDocument: "after" }
    );

    if (!alterado) {
      return res.status(404).json({ erro: "Cliente nao encontrado." });
    }

    res.status(200).json(alterado);
  } catch (erro) {
    console.error("PUT /clientes:", erro.message);
    res.status(503).json({ erro: "Erro ao alterar cliente." });
  }
});

app.delete("/clientes", async (req, res) => {
  const { _id } = req.body || {};

  if (!_id) {
    return res.status(400).json({ erro: "Informe o _id." });
  }

  try {
    const clientes = await obterClientes();
    const resultado = await clientes.deleteOne({ _id });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({ erro: "Cliente nao encontrado." });
    }

    res.status(200).end();
  } catch (erro) {
    console.error("DELETE /clientes:", erro.message);
    res.status(503).json({ erro: "Erro ao excluir cliente." });
  }
});

module.exports = app;

if (!process.env.VERCEL) {
  const porta = process.env.PORT || 3000;
  app.listen(porta, () => console.log(`API na porta ${porta}`));
}
