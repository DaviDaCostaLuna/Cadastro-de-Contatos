
const CHAVE_STORAGE = "contatos";
const CAMPOS = ["nome", "email", "telefone", "anoNascimento"];


const form = document.getElementById("form-contato");
const campoId = document.getElementById("contato-id");
const btnSalvar = document.getElementById("btn-salvar");
const btnLimpar = document.getElementById("btn-limpar");
const caixaMensagem = document.getElementById("mensagem");
const corpoTabela = document.getElementById("lista-contatos");
const contador = document.getElementById("contador");
const textoVazio = document.getElementById("vazio");
const campoBusca = document.getElementById("busca");

let contatos = carregarContatos();
let temporizadorMensagem;


function carregarContatos() {
  try {
    const dados = localStorage.getItem(CHAVE_STORAGE);
    return dados ? JSON.parse(dados) : [];
  } catch (erro) {
    return [];
  }
}

function salvarContatos() {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(contatos));
  } catch (erro) {
    mostrarMensagem("Não foi possível salvar os dados no navegador.", "erro");
  }
}

function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}


function lerFormulario() {
  return {
    nome: document.getElementById("nome").value.trim(),
    email: document.getElementById("email").value.trim(),
    telefone: document.getElementById("telefone").value.trim(),
    anoNascimento: document.getElementById("anoNascimento").value.trim(),
  };
}

function mostrarErros(erros) {
  CAMPOS.forEach((campo) => {
    const mensagem = erros[campo] || "";
    document.getElementById("erro-" + campo).textContent = mensagem;
    document.getElementById(campo).classList.toggle("invalido", Boolean(mensagem));
  });
}

function mostrarMensagem(texto, tipo) {
  caixaMensagem.textContent = texto;
  caixaMensagem.className = "mensagem mensagem--" + tipo;
  caixaMensagem.hidden = false;

  clearTimeout(temporizadorMensagem);
  temporizadorMensagem = setTimeout(() => {
    caixaMensagem.hidden = true;
  }, 3500);
}

function limparFormulario() {
  form.reset();
  campoId.value = "";
  mostrarErros({});
  btnSalvar.textContent = "Salvar contato";
}


function tratarEnvio(evento) {
  evento.preventDefault(); 

  const dados = lerFormulario();
  const erros = validarContato(dados); 


  const emailDuplicado = contatos.some(
    (c) => c.email.toLowerCase() === dados.email.toLowerCase() && c.id !== campoId.value
  );
  if (emailDuplicado && !erros.email) {
    erros.email = "Já existe um contato com este e-mail.";
  }

  mostrarErros(erros);

  if (Object.keys(erros).length > 0) {
    mostrarMensagem("Corrija os campos destacados.", "erro");
    return;
  }

  if (campoId.value) {
    
    contatos = contatos.map((c) => (c.id === campoId.value ? { ...c, ...dados } : c));
    mostrarMensagem("Contato atualizado com sucesso.", "sucesso");
  } else {
   
    contatos.push({ id: gerarId(), ...dados });
    mostrarMensagem("Contato cadastrado com sucesso.", "sucesso");
  }

  salvarContatos();
  limparFormulario();
  renderizarLista();
}


function editarContato(id) {
  const contato = contatos.find((c) => c.id === id);
  if (!contato) return;

  campoId.value = contato.id;
  document.getElementById("nome").value = contato.nome;
  document.getElementById("email").value = contato.email;
  document.getElementById("telefone").value = contato.telefone;
  document.getElementById("anoNascimento").value = contato.anoNascimento;

  mostrarErros({});
  btnSalvar.textContent = "Atualizar contato";
  form.scrollIntoView({ behavior: "smooth" });
  document.getElementById("nome").focus();
}

function excluirContato(id) {
  const contato = contatos.find((c) => c.id === id);
  if (!contato) return;

  if (!confirm(`Excluir o contato "${contato.nome}"?`)) return;

  contatos = contatos.filter((c) => c.id !== id);
  salvarContatos();


  if (campoId.value === id) limparFormulario();

  renderizarLista();
  mostrarMensagem("Contato excluído.", "sucesso");
}


function filtrarContatos() {
  const termo = campoBusca.value.trim().toLowerCase();
  if (!termo) return contatos;

  const termoDigitos = somenteDigitos(termo);

  return contatos.filter(
    (c) =>
      c.nome.toLowerCase().includes(termo) ||
      c.email.toLowerCase().includes(termo) ||
      c.telefone.toLowerCase().includes(termo) ||
      (termoDigitos !== "" && somenteDigitos(c.telefone).includes(termoDigitos))
  );
}

function criarBotao(texto, acao, id, estilo) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.textContent = texto;
  botao.className = "botao botao--pequeno " + estilo;
  botao.dataset.acao = acao;
  botao.dataset.id = id;
  return botao;
}

function criarLinha(contato) {
  const linha = document.createElement("tr");

  [contato.nome, contato.email, contato.telefone, contato.anoNascimento].forEach((valor) => {
    const celula = document.createElement("td");
    celula.textContent = valor; 
    linha.appendChild(celula);
  });

  const celulaAcoes = document.createElement("td");
  const grupo = document.createElement("div");
  grupo.className = "acoes";
  grupo.appendChild(criarBotao("Editar", "editar", contato.id, "botao--secundario"));
  grupo.appendChild(criarBotao("Excluir", "excluir", contato.id, "botao--perigo"));
  celulaAcoes.appendChild(grupo);
  linha.appendChild(celulaAcoes);

  return linha;
}

function renderizarLista() {
  const lista = filtrarContatos();

  corpoTabela.innerHTML = "";
  lista.forEach((contato) => corpoTabela.appendChild(criarLinha(contato)));

  contador.textContent = `${lista.length} registro(s)`;

  if (lista.length === 0) {
    textoVazio.textContent = contatos.length === 0
      ? "Nenhum contato cadastrado."
      : "Nenhum contato encontrado para essa busca.";
    textoVazio.hidden = false;
  } else {
    textoVazio.hidden = true;
  }
}

form.addEventListener("submit", tratarEnvio);
btnLimpar.addEventListener("click", limparFormulario);
campoBusca.addEventListener("input", renderizarLista);


corpoTabela.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button[data-acao]");
  if (!botao) return;

  if (botao.dataset.acao === "editar") editarContato(botao.dataset.id);
  if (botao.dataset.acao === "excluir") excluirContato(botao.dataset.id);
});


renderizarLista();
