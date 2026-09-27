import { Component } from '@angular/core';
import { Clientes } from './clientes/clientes'; // 1. Importa o componente aqui

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Clientes], // 2. Declara-o nos imports do componente principal
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'meu-primeiro-projeto';
}