import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../models/cliente.model';
import { ItemCarrinho } from '../models/item-carrinho.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class Clientes implements OnInit {
  // Lista oficial de produtos com os caminhos corretos apontando para a pasta public/assets/
  clientes: Array<Cliente & { imagem?: string }> = [
    { id: 1, nome: 'Chapa de PP (Polipropileno)', material: 'PP', precoMetro: 45.50, descricao: 'Alta resistência química e flexibilidade.', cores: ['Branco', 'Preto', 'Azul', 'Vermelho'], imagem: 'assets/pp.jpg' },
    { id: 2, nome: 'Chapa de PE (Polietileno)', material: 'PE', precoMetro: 38.00, descricao: 'Excelente para comunicação visual e sinalização.', cores: ['Branco Leitoso', 'Cristal', 'Preto'], imagem: 'assets/pe.jpg' },
    { id: 3, nome: 'Painel de Madeira', material: 'Madeira', precoMetro: 120.00, descricao: 'Acabamento nobre para projetos.', cores: ['Natural', 'Carvalho', 'Nogueira', 'Preto Fosco'], imagem: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=500&auto=format&fit=crop&q=60' },
    { id: 4, nome: 'Chapa de Aço', material: 'Aço', precoMetro: 210.90, descricao: 'Máxima durabilidade e robustez.', cores: ['Inox Escovado', 'Preto Brilho', 'Galvanizado'], imagem: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=60' }
  ];

  metragens: { [key: number]: number } = { 1: 1, 2: 1, 3: 1, 4: 1 };
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

  termoPesquisa: string = '';
  paginaAtual: string = 'home';
  
  dadosLogin = {
    email: '',
    senha: ''
  };

  anuncioGlobal: string = '🔥 Condição Especial: Frete grátis para cortes acima de 50 metros em chapas de PP e PE! Aproveite!';

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
    // Força a atualização do catálogo para limpar o storage antigo e assumir as imagens locais
    const versaoCatalogo = localStorage.getItem('fh_versao_catalogo');
    if (versaoCatalogo !== 'v7') {
      localStorage.removeItem('fh_produtos');
      localStorage.setItem('fh_versao_catalogo', 'v7');
    }

    const produtosSalvos = localStorage.getItem('fh_produtos');
    if (produtosSalvos) {
      this.clientes = JSON.parse(produtosSalvos);
    } else {
      this.salvarProdutosNoStorage();
    }

    const anuncioSalvo = localStorage.getItem('fh_anuncio');
    if (anuncioSalvo) {
      this.anuncioGlobal = anuncioSalvo;
    }

    const carrinhoSalvo = localStorage.getItem('fh_carrinho');
    if (carrinhoSalvo) {
      this.carrinho = JSON.parse(carrinhoSalvo);
    }
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
      alert('Preencha o nome e um preço válido por metro!');
      return;
    }

    const novoId = this.clientes.length > 0 ? Math.max(...this.clientes.map(p => p.id)) + 1 : 1;
    
    this.clientes.push({
      id: novoId,
      nome: this.novoProdutoAdmin.nome,
      material: this.novoProdutoAdmin.material || 'Geral',
      precoMetro: Number(this.novoProdutoAdmin.precoMetro),
      descricao: this.novoProdutoAdmin.descricao || 'Material industrial de alta qualidade.',
      cores: ['Branco', 'Preto', 'Natural'],
      imagem: this.novoProdutoAdmin.imagem || 'assets/logo.jpeg'
    });

    this.metragens[novoId] = 1;
    this.salvarProdutosNoStorage();

    this.novoProdutoAdmin = { id: 0, nome: '', material: '', precoMetro: 0, descricao: '', cores: ['Branco', 'Preto'], imagem: '' };
    alert('Novo material cadastrado e guardado com sucesso!');
  }

  removerProdutoAdmin(id: number) {
    if (confirm('Tem certeza que deseja apagar este material do catálogo?')) {
      this.clientes = this.clientes.filter(p => p.id !== id);
      this.salvarProdutosNoStorage();
    }
  }

  alterarPrecoDireto() {
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

  adicionarAoCarrinho(produto: Cliente) {
    const qtd = this.metragens[produto.id] || 1;
    const cor = this.corSelecionada[produto.id];

    if (!cor) {
      alert('Por favor, selecione uma cor antes de adicionar ao pedido!');
      return;
    }

    const total = qtd * produto.precoMetro;

    this.carrinho.push({
      nomeProduto: produto.nome,
      material: produto.material,
      cor: cor,
      metragem: qtd,
      precoTotal: total
    });

    this.salvarCarrinhoNoStorage();
    alert('Material adicionado ao pedido com sucesso!');
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