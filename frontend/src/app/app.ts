import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './basic/header/header';
import { CommonModule } from '@angular/common';
import { Footer } from './basic/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
}
