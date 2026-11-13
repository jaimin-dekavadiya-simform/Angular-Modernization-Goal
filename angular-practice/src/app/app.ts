import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { RouterOutlet } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';

interface LoginForm {
  username: string;
  password: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormField, Dashboard],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  loginModel = signal<LoginForm>({ username: 'jaimin', password: 'jash1508' });
  loginForm = form(this.loginModel);
}
