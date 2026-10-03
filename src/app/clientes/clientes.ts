import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../models/cliente.model';
import { ItemCarrinho } from '../models/item-carrinho.model';
import { Produto3dComponent } from '../produto-3d.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, Produto3dComponent],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class Clientes implements OnInit {
  // Lista oficial de produtos focada em fabricação de produtos personalizados (Coolers, Bandejas, Gabinetes e Painéis)
  clientes: Array<Cliente & { imagem?: string }> = [
    { 
      id: 1, 
      nome: 'Cooler Térmico Industrial em PP', 
      material: 'PP', 
      precoMetro: 180.00, 
      descricao: 'Cooler fabricado em polipropileno de alta resistência, ideal para personalização e eventos.', 
      cores: ['Preto Fosco', 'Branco Brilhante', 'Azul Industrial', 'Amarelo Segurança', 'Vermelho Vivo'], 
      imagem: 'assets/pp.jpg' 
    },
    { 
      id: 2, 
      nome: 'Bandeja Organizadora e Expositora', 
      material: 'PS', 
      precoMetro: 95.50, 
      descricao: 'Bandeja estruturada em poliestireno, perfeita para organização e expositores.', 
      cores: ['Preto Fosco', 'Branco Brilhante', 'Cinza Claro', 'Azul Translúcido', 'Verde Técnico'], 
      imagem: 'assets/pe.jpg' 
    },
    { 
      id: 3, 
      nome: 'Painel Decorativo e Expositor em Madeira', 
      material: 'Madeira', 
      precoMetro: 150.00, 
      descricao: 'Painéis e suportes em chapa de madeira tratados para corte de precisão e acabamento fino.', 
      cores: ['MDF Natural', 'Carvalho Escuro', 'Preto Fosco', 'Nogueira', 'Castanho Mel'], 
      imagem: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=500&auto=format&fit=crop&q=60' 
    },
    { 
      id: 4, 
      nome: 'Gabinete Técnico Modular em Aço', 
      material: 'Aço', 
      precoMetro: 240.00, 
      descricao: 'Gabinete e estrutura metálica maquinada e dobrada sob medida em chapa de aço resistente.', 
      cores: ['Inox Escovado', 'Preto Texturizado', 'Cinza Galvanizado', 'Cobre Metálico', 'Antracite Industrial'], 
      imagem: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=60' 
    }
  ];

  // Gestão de dimensões em centímetros por ID de produto
  dimensoes: { [key: number]: { largura: number; altura: number; profundidade: number } } = {
    1: { largura: 40, altura: 30, profundidade: 30 },
    2: { largura: 45, altura: 15, profundidade: 35 },
    3: { largura: 50, altura: 50, profundidade: 5 },
    4: { largura: 40, altura: 50, profundidade: 35 }
  };

  // Gestão de logótipos/textos personalizados por ID de produto
  logotipos: { [key: number]: string } = {};

  quantidades: { [key: number]: number } = { 1: 1, 2: 1, 3: 1, 4: 1 };
  precosCalculados: { [key: number]: number } = {};
  corSelecionada: { [key: number]: string } = {};
  carrinho: ItemCarrinho[] = [];

  exibirCheckout: boolean = false;
  pedidoFinalizado: boolean = false;
  
  cliente = {
    nome: '',
    email: '',
    telefone: '',
    morada: ''
  };

  // Objeto para o formulário de pedido personalizado
  pedidoPersonalizado = {
    tipoProduto: '',
    material: '',
    cor: '',
    quantidade: 1,
    precoEstimado: 150.00,
    observacoes: ''
  };

  termoPesquisa: string = '';
  paginaAtual: string = 'home';
  
  dadosLogin = {
    email: '',
    senha: ''
  };

  anuncioGlobal: string = '🔥 Condição Especial: Frete grátis para encomendas de fabricação acima de 5 unidades! Aproveite!';

  // Estado e mensagens do Chatbot de Engenharia
  chatbotAberto: boolean = false;
  inputMensagemChat: string = '';
  mensagensChat: Array<{ remetente: 'usuario' | 'bot'; texto: string }> = [];

  novoProdutoAdmin: Cliente & { imagem?: string } = {
    id: 0,
    nome: '',
    material: '',
    precoMetro: 0,
    descricao: '',
    cores: ['Branco', 'Preto'],
    imagem: ''
  };

  ngOnInit() {
    // Versão v11 para forçar o reset do localStorage com as novas dimensões e preços dinâmicos
    const versaoCatalogo = localStorage.getItem('fh_versao_catalogo');
    if (versaoCatalogo !== 'v11') {
      localStorage.removeItem('fh_produtos');
      localStorage.setItem('fh_versao_catalogo', 'v11');
    }

    const produtosSalvos = localStorage.getItem('fh_produtos');
    if (produtosSalvos) {
      this.clientes = JSON.parse(produtosSalvos);
    } else {
      this.salvarProdutosNoStorage();
    }

    // Inicializar cálculo de preços para cada produto carregado
    this.clientes.forEach(p => {
      this.calcularPrecoDinamico(p.id);
    });

    const anuncioSalvo = localStorage.getItem('fh_anuncio');
    if (anuncioSalvo) {
      this.anuncioGlobal = anuncioSalvo;
    }

    const carrinhoSalvo = localStorage.getItem('fh_carrinho');
    if (carrinhoSalvo) {
      this.carrinho = JSON.parse(carrinhoSalvo);
    }
  }

  toggleChatbot() {
    this.chatbotAberto = !this.chatbotAberto;
  }

  enviarMensagemChat() {
    if (!this.inputMensagemChat.trim()) return;

    const textoUsuario = this.inputMensagemChat;
    this.mensagensChat.push({ remetente: 'usuario', texto: textoUsuario });
    this.inputMensagemChat = '';

    // Simulação de resposta inteligente baseada em engenharia e materiais da FH Maruyama
    setTimeout(() => {
      let resposta = "Compreendo a sua dúvida. Para projetos industriais personalizados em PP, PS, Aço ou Madeira, recomendamos preencher as dimensões exatas no nosso simulador 3D.";
      const q = textoUsuario.toLowerCase();

      if (q.includes('pp') || q.includes('polipropileno') || q.includes('cooler')) {
        resposta = "O Polipropileno (PP) que utilizamos nos coolers térmicos industriais oferece alta resistência química, leveza e excelente isolamento térmico.";
      } else if (q.includes('aço') || q.includes('chapa') || q.includes('gabinete')) {
        resposta = "As nossas estruturas em chapa de aço passam por processos rigorosos de corte e dobragem sob medida, ideais para ambientes industriais exigentes.";
      } else if (q.includes('madeira') || q.includes('painel')) {
        resposta = "Trabalhamos com painéis de madeira e MDF de alta densidade, tratados com acabamento de precisão para suportar montagens técnicas.";
      } else if (q.includes('prazo') || q.includes('entrega') || q.includes('tempo')) {
        resposta = "O prazo médio de fabricação própria na nossa oficina em São Paulo é de 5 a 10 dias úteis após a aprovação do orçamento.";
      } else if (q.includes('desconto') || q.includes('frete')) {
        resposta = "Temos condições especiais para encomendas de fabricação acima de 5 unidades, incluindo frete grátis conforme indicado no nosso anúncio global!";
      }

      this.mensagensChat.push({ remetente: 'bot', texto: resposta });
    }, 500);
  }

  calcularPrecoDinamico(produtoId: number) {
    const produto = this.clientes.find(p => p.id === produtoId);
    if (!produto) return;

    const dim = this.dimensoes[produtoId] || { largura: 40, altura: 30, profundidade: 30 };
    const qtd = this.quantidades[produtoId] || 1;

    // Fórmula de Custo Industrial baseada no volume/proporção dimensional em relação ao padrão (40x30x30 = 36000 cm³)
    const volumePadrao = 40 * 30 * 30;
    const volumeAtual = Math.max(dim.largura * dim.altura * dim.profundidade, 1000);
    
    // Fator de proporção dimensional com peso no material
    let fatorMaterial = 1.0;
    if (produto.material.toLowerCase().includes('aço')) fatorMaterial = 1.35;
    if (produto.material.toLowerCase().includes('madeira')) fatorMaterial = 1.15;

    const precoUnitario = produto.precoMetro * (volumeAtual / volumePadrao) * fatorMaterial;
    this.precosCalculados[produtoId] = Math.max(precoUnitario * qtd, produto.precoMetro * 0.5);
  }

  salvarProdutosNoStorage() {
    localStorage.setItem('fh_produtos', JSON.stringify(this.clientes));
  }

  salvarCarrinhoNoStorage() {
    localStorage.setItem('fh_carrinho', JSON.stringify(this.carrinho));
  }

  atualizarAnuncioGlobal() {
    localStorage.setItem('fh_anuncio', this.anuncioGlobal);
    alert('Anúncio atualizado e guardado com sucesso!');
  }

  irParaPagina(pagina: string) {
    this.paginaAtual = pagina;
    this.exibirCheckout = false;
    this.pedidoFinalizado = false;
    window.scrollTo(0, 0);
  }

  filtrarCategoria(categoria: string) {
    this.termoPesquisa = categoria;
    this.paginaAtual = 'loja';
    this.exibirCheckout = false;
    this.pedidoFinalizado = false;
    window.scrollTo(0, 0);
  }

  adicionarPedidoPersonalizado(event: Event) {
    event.preventDefault();
    
    if (!this.pedidoPersonalizado.tipoProduto || !this.pedidoPersonalizado.material || !this.pedidoPersonalizado.cor) {
      alert('Por favor, preencha o produto, o material e a cor!');
      return;
    }

    const totalCalculado = this.pedidoPersonalizado.quantidade * this.pedidoPersonalizado.precoEstimado;

    this.carrinho.push({
      nomeProduto: `${this.pedidoPersonalizado.tipoProduto} (${this.pedidoPersonalizado.material})`,
      material: this.pedidoPersonalizado.material,
      cor: this.pedidoPersonalizado.cor,
      metragem: this.pedidoPersonalizado.quantidade,
      precoTotal: totalCalculado
    });

    this.salvarCarrinhoNoStorage();
    alert('Pedido personalizado adicionado ao carrinho com sucesso!');
    this.irParaPagina('loja');
  }

  fazerLoginCliente(event: Event) {
    event.preventDefault();
    if (!this.dadosLogin.email) {
      alert('Por favor, digite o seu e-mail!');
      return;
    }
    this.paginaAtual = 'loja';
  }

  fazerLoginAdmin(event: Event) {
    event.preventDefault();
    if (this.dadosLogin.email === 'admin@fh.com' && this.dadosLogin.senha === '1234') {
      this.paginaAtual = 'admin-painel';
      alert('Bem-vindo ao Painel de Administração da FH Maruyama!');
    } else {
      alert('Credenciais de Administrador inválidas! Use admin@fh.com e senha 1234.');
    }
  }

  adicionarProdutoAdmin() {
    if (!this.novoProdutoAdmin.nome || this.novoProdutoAdmin.precoMetro <= 0) {
      alert('Preencha o nome e um preço válido!');
      return;
    }

    const novoId = this.clientes.length > 0 ? Math.max(...this.clientes.map(p => p.id)) + 1 : 1;
    
    this.clientes.push({
      id: novoId,
      nome: this.novoProdutoAdmin.nome,
      material: this.novoProdutoAdmin.material || 'Geral',
      precoMetro: Number(this.novoProdutoAdmin.precoMetro),
      descricao: this.novoProdutoAdmin.descricao || 'Produto fabricado sob medida.',
      cores: ['Branco', 'Preto', 'Natural'],
      imagem: this.novoProdutoAdmin.imagem || 'assets/logo.jpeg'
    });

    this.dimensoes[novoId] = { largura: 40, altura: 30, profundidade: 30 };
    this.quantidades[novoId] = 1;
    this.calcularPrecoDinamico(novoId);
    this.salvarProdutosNoStorage();

    this.novoProdutoAdmin = { id: 0, nome: '', material: '', precoMetro: 0, descricao: '', cores: ['Branco', 'Preto'], imagem: '' };
    alert('Novo produto cadastrado e guardado com sucesso!');
  }

  removerProdutoAdmin(id: number) {
    if (confirm('Tem certeza que deseja apagar este produto do catálogo?')) {
      this.clientes = this.clientes.filter(p => p.id !== id);
      this.salvarProdutosNoStorage();
    }
  }

  alterarPrecoDireto() {
    this.clientes.forEach(p => this.calcularPrecoDinamico(p.id));
    this.salvarProdutosNoStorage();
  }

  get materiaisFiltrados() {
    if (!this.termoPesquisa) {
      return this.clientes;
    }
    return this.clientes.filter(p => 
      p.nome.toLowerCase().includes(this.termoPesquisa.toLowerCase()) ||
      p.material.toLowerCase().includes(this.termoPesquisa.toLowerCase())
    );
  }

  adicionarAoCarrinhoDinamico(produto: Cliente) {
    const cor = this.corSelecionada[produto.id];

    if (!cor) {
      alert('Por favor, selecione um acabamento/cor antes de adicionar ao pedido!');
      return;
    }

    const dim = this.dimensoes[produto.id];
    const qtd = this.quantidades[produto.id] || 1;
    const logo = this.logotipos[produto.id] ? ` [Logo: ${this.logotipos[produto.id]}]` : '';
    const precoFinal = this.precosCalculados[produto.id] || produto.precoMetro;

    this.carrinho.push({
      nomeProduto: `${produto.nome} [${dim.largura}x${dim.altura}x${dim.profundidade}cm]${logo}`,
      material: produto.material,
      cor: cor,
      metragem: qtd,
      precoTotal: precoFinal
    });

    this.salvarCarrinhoNoStorage();
    alert('Produto personalizado com logótipo adicionado ao pedido com sucesso!');
  }

  abrirModalAR(produto: Cliente) {
    const dim = this.dimensoes[produto.id] || { largura: 40, altura: 30, profundidade: 30 };
    const cor = this.corSelecionada[produto.id] || 'Padrão';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobile) {
      alert(`📱 Realidade Aumentada (AR):\n\nAceda a esta página através do seu telemóvel (Android ou iPhone) para projetar o produto "${produto.nome}" (${dim.largura}x${dim.altura}x${dim.profundidade}cm - Acabamento: ${cor}) em tamanho real no seu ambiente físico!`);
      return;
    }

    alert(`A preparar o modo AR para: ${produto.nome}\nDimensões: ${dim.largura}x${dim.altura}x${dim.profundidade}cm\n\nAponte a câmara do telemóvel para uma superfície plana.`);
    
    if ('xr' in navigator) {
      console.log('Sessão WebXR AR ativada.');
    } else {
      window.open(`https://ar.google.com/vr?type=Object&url=&title=${encodeURIComponent(produto.nome)}`, '_blank');
    }
  }

  removerItem(index: number) {
    this.carrinho.splice(index, 1);
    this.salvarCarrinhoNoStorage();
  }

  get totalGeral(): number {
    return this.carrinho.reduce((soma, item) => soma + item.precoTotal, 0);
  }

  irParaCheckout() {
    if (this.carrinho.length === 0) {
      alert('O carrinho está vazio!');
      return;
    }
    this.exibirCheckout = true;
  }

  voltarAoCarrinho() {
    this.exibirCheckout = false;
  }

  finalizarPedido() {
    if (!this.cliente.nome || !this.cliente.email || !this.cliente.telefone) {
      alert('Por favor, preencha os campos obrigatórios de contacto!');
      return;
    }
    this.pedidoFinalizado = true;
    this.carrinho = [];
    localStorage.removeItem('fh_carrinho');
  }

  novoPedido() {
    this.carrinho = [];
    localStorage.removeItem('fh_carrinho');
    this.exibirCheckout = false;
    this.pedidoFinalizado = false;
    this.cliente = { nome: '', email: '', telefone: '', morada: '' };
    this.termoPesquisa = '';
    this.irParaPagina('home');
  }
}