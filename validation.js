/* ==========================================================
   validation.js - funções de validação dos campos do contato
   Deve ser carregado ANTES do app.js no index.html.
   ========================================================== */

const ANO_MINIMO = 1900;

function somenteDigitos(texto) {
  return String(texto ?? "").replace(/\D/g, "");
}

function validarNome(nome) {
  const valor = String(nome ?? "").trim();

  if (valor === "") return "Informe o nome.";
  if (valor.length < 3) return "O nome deve ter pelo menos 3 caracteres.";
  if (valor.length > 100) return "O nome deve ter no máximo 100 caracteres.";
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(valor)) {
    return "O nome deve conter apenas letras, espaços, hífen e apóstrofo.";
  }
  return "";
}

function validarEmail(email) {
  const valor = String(email ?? "").trim();

  if (valor === "") return "Informe o e-mail.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
    return "Informe um e-mail válido (ex.: nome@exemplo.com).";
  }
  return "";
}

function validarTelefone(telefone) {
  const digitos = somenteDigitos(telefone);

  if (digitos === "") return "Informe o telefone.";
  if (digitos.length !== 10 && digitos.length !== 11) {
    return "O telefone deve ter 10 ou 11 dígitos, com DDD.";
  }
  if (Number(digitos.slice(0, 2)) < 11) return "DDD inválido.";
  if (digitos.length === 11 && digitos[2] !== "9") {
    return "Celular com 11 dígitos deve começar com 9 depois do DDD.";
  }
  return "";
}

function validarAnoNascimento(ano) {
  const texto = String(ano ?? "").trim();

  if (texto === "") return "Informe o ano de nascimento.";

  const numero = Number(texto);
  if (!Number.isInteger(numero)) return "O ano deve ser um número inteiro.";

  const anoAtual = new Date().getFullYear();
  if (numero < ANO_MINIMO || numero > anoAtual) {
    return `O ano deve estar entre ${ANO_MINIMO} e ${anoAtual}.`;
  }
  return "";
}

function validarContato(contato) {
  const erros = {};

  const erroNome = validarNome(contato.nome);
  if (erroNome) erros.nome = erroNome;

  const erroEmail = validarEmail(contato.email);
  if (erroEmail) erros.email = erroEmail;

  const erroTelefone = validarTelefone(contato.telefone);
  if (erroTelefone) erros.telefone = erroTelefone;

  const erroAno = validarAnoNascimento(contato.anoNascimento);
  if (erroAno) erros.anoNascimento = erroAno;

  return erros;
}