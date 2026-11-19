const express = require("express");
const { MongoClient } = require("mongodb");
const { randomUUID } = require("crypto");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Defina MONGODB_URI.");
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI);
let clientes;

async function conectarBanco() {
  await client.connect();
  clientes = client.db("smartbank_api").collection("clientes");
}

app.get("/clientes", async (req, res) => {
  const lista = await clientes.find({}).toArray();
  res.status(200).json(lista);
});

app.post("/clientes", async (req, res) => {
  const { nome, sobreNome } = req.body;

  if (!nome || !sobreNome) {
    return res.status(400).json({ erro: "Informe nome e sobreNome." });
  }

  await clientes.insertOne({
    _id: randomUUID(),
    nome,
    sobreNome
  });

  res.status(200).end();
});

app.put("/clientes", async (req, res) => {
  const { _id, ...dados } = req.body;

  if (!_id) {
    return res.status(400).json({ erro: "Informe o _id do cliente." });
  }

  const alterado = await clientes.findOneAndUpdate(
    { _id },
    { $set: dados },
    { returnDocument: "after" }
  );

  if (!alterado) {
    return res.status(404).json({ erro: "Cliente não encontrado." });
  }

  res.status(200).json(alterado);
});

app.delete("/clientes", async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res.status(400).json({ erro: "Informe o _id do cliente." });
  }

  const resultado = await clientes.deleteOne({ _id });

  if (resultado.deletedCount === 0) {
    return res.status(404).json({ erro: "Cliente não encontrado." });
  }

  res.status(200).end();
});

app.get("/", (req, res) => {
  res.status(200).send("API de clientes funcionando.");
});

conectarBanco()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  });
