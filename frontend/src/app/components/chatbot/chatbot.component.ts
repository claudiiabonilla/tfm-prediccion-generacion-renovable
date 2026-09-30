import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatbotVisibilidadService } from '../../services/chatbot-visibilidad.service';
import { ChatbotService } from '../../services/chatbot.service';

interface Mensaje {
  texto: string;
  esUsuario: boolean;
}

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent {
  abierto = false;
  mensajeActual = '';
  enviando = false;
  mensajes: Mensaje[] = [
    { texto: 'Hola, puedo ayudarte a interpretar la predicción de generación fotovoltaica. ¿Qué quieres saber?', esUsuario: false }
  ];

  constructor(
    private chatbotService: ChatbotService,
    public visibilidad: ChatbotVisibilidadService
  ) {}

  cerrar() {
    this.visibilidad.cerrar();
  }

  enviarMensaje() {
    if (!this.mensajeActual.trim() || this.enviando) return;

    const pregunta = this.mensajeActual;
    this.mensajes.push({ texto: pregunta, esUsuario: true });
    this.mensajeActual = '';
    this.enviando = true;

    this.chatbotService.enviarPregunta(pregunta).subscribe({
      next: (res) => {
        this.mensajes.push({ texto: res.respuesta, esUsuario: false });
        this.enviando = false;
      },
      error: () => {
        this.mensajes.push({ texto: 'No he podido conectar con el asistente. Inténtalo de nuevo.', esUsuario: false });
        this.enviando = false;
      }
    });
  }
}
