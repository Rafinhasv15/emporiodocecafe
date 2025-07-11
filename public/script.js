// script.js corrigido e aprimorado

// Alternância do painel manual
const btn = document.getElementById("toggleBtn");
const painel = document.getElementById("painelHD");

btn.addEventListener("click", () => {
  painel.classList.toggle("hide");
});

// Variáveis globais
let contador = 0;
let total = 0;

const contadorElemento = document.getElementById('contador');
const totalElemento = document.getElementById('total');
const listaItens = document.getElementById('box-container');

// Atualiza o número de itens
function atualizarContador() {
  contadorElemento.textContent = `Itens no carrinho: ${contador}`;
}

// Atualiza o total da compra
function atualizarTotal() {
  totalElemento.textContent = `Total: R$ ${total.toFixed(2)}`;
}

// Adiciona item ao carrinho
function adicionarAoCarrinho(nome, preco) {
  contador++;
  total += preco;
  atualizarContador();
  atualizarTotal();

  const li = document.createElement('li');
  li.classList.add('item-carrinho');

  const spanNome = document.createElement('span');
  spanNome.classList.add('nome-item');
  spanNome.textContent = nome;

  const spanPreco = document.createElement('span');
  spanPreco.classList.add('preco-item');
  spanPreco.textContent = `R$ ${preco.toFixed(2)}`;

  const botaoCancelar = document.createElement('button');
  botaoCancelar.textContent = 'Cancelar';
  botaoCancelar.classList.add('botao-cancelar');
  botaoCancelar.onclick = function () {
    li.remove();
    contador--;
    total -= preco;
    atualizarContador();
    atualizarTotal();
    // Remove do localStorage
    let carrinhoAtual = JSON.parse(localStorage.getItem('carrinho')) || [];
    // Remove apenas o primeiro item igual (nome e preco)
    const idx = carrinhoAtual.findIndex(item => item.nome === nome && item.preco === preco);
    if (idx !== -1) {
      carrinhoAtual.splice(idx, 1);
      localStorage.setItem('carrinho', JSON.stringify(carrinhoAtual));
    }
  };

  li.appendChild(spanNome);
  li.appendChild(spanPreco);
  li.appendChild(botaoCancelar);
  listaItens.appendChild(li);

  // Abre o painel automaticamente ao adicionar item
  painel.classList.remove("hide");

  // Armazena no localStorage
  const carrinhoAtual = JSON.parse(localStorage.getItem('carrinho')) || [];
  carrinhoAtual.push({ nome, preco, quantidade: 1 });
  localStorage.setItem('carrinho', JSON.stringify(carrinhoAtual));
}

document.addEventListener("DOMContentLoaded", function () {
  const metodoBtns = document.querySelectorAll(".method");
  const sections = document.querySelectorAll(".payment-section");
  const form = document.getElementById("form-pagamento");

  let metodoSelecionado = null;

  metodoBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      metodoSelecionado = btn.dataset.method;

      metodoBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      sections.forEach(section => {
        section.style.display = section.id === metodoSelecionado ? "block" : "none";
      });
    });
  });

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const nome = document.getElementById("nome").value.trim();
      const email = document.getElementById("email").value.trim().toLowerCase();
      const rua = document.getElementById("rua").value.trim();
      const numero = document.getElementById("numero").value.trim();
      const cidade = document.getElementById("cidade").value.trim();
      const complemento = document.getElementById("complemento")?.value.trim() || "";

      if (!nome || !email || !rua || !numero || !cidade) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("E-mail inválido.");
        return;
      }

      if (!metodoSelecionado) {
        alert("Por favor, selecione um método de pagamento.");
        return;
      }

      if (metodoSelecionado === "cartao") {
        const numeroCartao = document.getElementById("numero-cartao").value.trim();
        const validade = document.getElementById("validade").value.trim();
        const cvv = document.getElementById("cvv").value.trim();

        if (!numeroCartao || !validade || !cvv) {
          alert("Preencha todos os dados do cartão.");
          return;
        }

        if (!/^\d{16}$/.test(numeroCartao.replace(/\s+/g, ''))) {
          alert("Número do cartão inválido. Deve conter 16 dígitos.");
          return;
        }

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(validade)) {
          alert("Validade inválida. Use o formato MM/AA.");
          return;
        }

        if (!/^\d{3}$/.test(cvv)) {
          alert("CVV inválido. Deve conter 3 dígitos.");
          return;
        }
      }

// Pega os produtos do carrinho no localStorage
const produtos = JSON.parse(localStorage.getItem('carrinho')) || [];

// Corrige os produtos para garantir que cada um tenha 'quantidade'
const produtosCorrigidos = produtos.map(prod => ({
  ...prod,
  quantidade: prod.quantidade || 1 // se não tiver quantidade, coloca 1
}));

console.log("Produtos corrigidos:", produtosCorrigidos);

// Cria o objeto cliente com os dados do formulário
const cliente = {
  nome,
  email,
  endereco: {
    rua,
    numero,
    complemento,
    cidade
  }
};

// Monta o pedido para enviar pro servidor
const pedido = {
  cliente,
  produtos: produtosCorrigidos,
  metodoPagamento: metodoSelecionado
};

// Guarda alguns dados no localStorage para usar depois, por exemplo no pagamento
localStorage.setItem('dadosCliente', JSON.stringify({
  nome,
  email,
  metodo: metodoSelecionado,
  endereco: cliente.endereco
}));

console.log("🛒 Pedido sendo enviado:", JSON.stringify(pedido, null, 2));
console.log("🔍 Pedido que está indo pro servidor:", JSON.stringify(pedido, null, 2));

// Envia o pedido pro servidor
fetch('/pedido', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(pedido)
})
.then(response => {
  if (response.ok) {
    alert('Pedido enviado com sucesso! 🧾');
    localStorage.removeItem('carrinho');
    window.location.href = "pagamento.html";
  } else {
    alert('Erro ao enviar o pedido.');
  }
})
.catch(error => {
  console.error('Erro:', error);
  alert('Erro na comunicação com o servidor.');
});
    });
  }
});