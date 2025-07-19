import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User, AuthFormData } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static readonly AUTHLink = 'http://localhost:8090/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();



  constructor() {
    // Check for stored user
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  signIn(email: string, password: string): Observable<User> {
    // Mock authentication - simulate API call
    return of(null).pipe(
      delay(1000),
      map(() => {
        // if (user && password === 'password') {
        //   localStorage.setItem('currentUser', JSON.stringify(user));
        //   this.currentUserSubject.next(user);
        //   return user;
        // }
        throw new Error('Invalid email or password');
      })
    );
  }

  async signUp(formData: AuthFormData): Promise<void> {
   
        let res = await fetch(AuthService.AUTHLink + '/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }).then((res) => res.json())
          .catch(error => {
            throw new Error(error.message || 'Registration failed');
          });
        console.log(res);
        const user: User = {
          id: res.id,
          email: res.email,
          name: res.name,
          role: res.role,
          avatar: res.avatar || '',
          createdAt: new Date(res.createdAt)
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
  }

  signOut(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  isSeller(): boolean {
    return this.currentUserValue?.role === 'seller';
  }
}