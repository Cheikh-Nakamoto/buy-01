import { Injectable } from "@angular/core";

export abstract class StorageService {
    abstract getItem(key: string): string | null;
    abstract setItem(key: string, value: string): void;
    abstract removeItem(key: string): void;
}


@Injectable({ providedIn: 'root' })
export class BrowserStorageService extends StorageService {
    getItem(key: string): string | null {
        return localStorage.getItem(key);
    }

    setItem(key: string, value: string): void {
        localStorage.setItem(key, value);
    }

    removeItem(key: string): void {
        localStorage.removeItem(key);
    }
}


// Mock pour les tests
@Injectable()
export class MockStorageService extends StorageService {
    private storage = new Map<string, string>();

    getItem(key: string): string | null {
        return this.storage.get(key) || null;
    }

    setItem(key: string, value: string): void {
        this.storage.set(key, value);
    }

    removeItem(key: string): void {
        this.storage.delete(key);
    }

    clear(): void {
        this.storage.clear();
    }
}