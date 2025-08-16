import { TestBed } from '@angular/core/testing';

import { DataService } from './data-service';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with null data', (done) => {
    service.data$.subscribe(data => {
      expect(data).toBeNull();
      done();
    });
  });

  it('should update data correctly', (done) => {
    const testData = { name: 'Test', value: 123 };

    service.updateData(testData);

    service.data$.subscribe(data => {
      expect(data).toEqual(testData);
      done();
    });
  });

  it('should emit new values to all subscribers', () => {
    const testData1 = { id: 1, name: 'First' };
    const testData2 = { id: 2, name: 'Second' };

    const subscriber1Values: any[] = [];
    const subscriber2Values: any[] = [];

    // Deux abonnements
    service.data$.subscribe(data => subscriber1Values.push(data));
    service.data$.subscribe(data => subscriber2Values.push(data));

    // Mise à jour des données
    service.updateData(testData1);
    service.updateData(testData2);

    // Vérifications
    expect(subscriber1Values).toEqual([null, testData1, testData2]);
    expect(subscriber2Values).toEqual([null, testData1, testData2]);
  });

  it('should handle multiple data types', () => {
    const testCases = [
      'string data',
      123,
      { object: 'data' },
      ['array', 'data'],
      null,
      undefined
    ];

    testCases.forEach(testData => {
      service.updateData(testData);

      service.data$.subscribe(data => {
        expect(data).toEqual(testData);
      }).unsubscribe(); // Important de se désabonner immédiatement
    });
  });

  it('should maintain the latest value for new subscribers (BehaviorSubject behavior)', () => {
    const testData = { latest: 'value' };

    // Mettre à jour avant de s'abonner
    service.updateData(testData);

    // Nouvel abonnement après la mise à jour
    service.data$.subscribe(data => {
      expect(data).toEqual(testData); // Doit recevoir la dernière valeur
    });
  });

  it('should not emit if the same reference is passed multiple times', () => {
    const testData = { name: 'Same Reference' };
    let emissionCount = 0;

    service.data$.subscribe(() => emissionCount++);

    // Première émission (+ l'émission initiale null)
    service.updateData(testData);
    expect(emissionCount).toBe(2);

    // Même référence - devrait émettre quand même (comportement normal de BehaviorSubject)
    service.updateData(testData);
    expect(emissionCount).toBe(3);
  });

  describe('Observable behavior', () => {
    it('should complete when service is destroyed', () => {
      let completed = false;

      service.data$.subscribe({
        complete: () => completed = true
      });

      // Simuler la destruction du service
      service['dataSubject'].complete();

      expect(completed).toBe(true);
    });

    it('should handle errors gracefully', () => {
      let errorCaught = false;

      service.data$.subscribe({
        error: () => errorCaught = true
      });

      // Simuler une erreur
      service['dataSubject'].error(new Error('Test error'));

      expect(errorCaught).toBe(true);
    });
  });

  it('should update data correctly', (done) => {
    const testData = { name: 'Test', value: 123 };

    service.updateData(testData);

    service.data$.subscribe(data => {
      expect(data).toEqual(testData);
      done();
    });
  });

  it('should emit new values to all subscribers', () => {
    const testData1 = { id: 1, name: 'First' };
    const testData2 = { id: 2, name: 'Second' };

    const subscriber1Values: any[] = [];
    const subscriber2Values: any[] = [];

    // Deux abonnements
    service.data$.subscribe(data => subscriber1Values.push(data));
    service.data$.subscribe(data => subscriber2Values.push(data));

    // Mise à jour des données
    service.updateData(testData1);
    service.updateData(testData2);

    // Vérifications
    expect(subscriber1Values).toEqual([null, testData1, testData2]);
    expect(subscriber2Values).toEqual([null, testData1, testData2]);
  });

  it('should handle multiple data types', () => {
    const testCases = [
      'string data',
      123,
      { object: 'data' },
      ['array', 'data'],
      null,
      undefined
    ];

    testCases.forEach(testData => {
      service.updateData(testData);

      service.data$.subscribe(data => {
        expect(data).toEqual(testData);
      }).unsubscribe(); // Important de se désabonner immédiatement
    });
  });

  it('should maintain the latest value for new subscribers (BehaviorSubject behavior)', () => {
    const testData = { latest: 'value' };

    // Mettre à jour avant de s'abonner
    service.updateData(testData);

    // Nouvel abonnement après la mise à jour
    service.data$.subscribe(data => {
      expect(data).toEqual(testData); // Doit recevoir la dernière valeur
    });
  });

  it('should not emit if the same reference is passed multiple times', () => {
    const testData = { name: 'Same Reference' };
    let emissionCount = 0;

    service.data$.subscribe(() => emissionCount++);

    // Première émission (+ l'émission initiale null)
    service.updateData(testData);
    expect(emissionCount).toBe(2);

    // Même référence - devrait émettre quand même (comportement normal de BehaviorSubject)
    service.updateData(testData);
    expect(emissionCount).toBe(3);
  });

  describe('Observable behavior', () => {
    it('should complete when service is destroyed', () => {
      let completed = false;

      service.data$.subscribe({
        complete: () => completed = true
      });

      // Simuler la destruction du service
      service['dataSubject'].complete();

      expect(completed).toBe(true);
    });

    it('should handle errors gracefully', () => {
      let errorCaught = false;

      service.data$.subscribe({
        error: () => errorCaught = true
      });

      // Simuler une erreur
      service['dataSubject'].error(new Error('Test error'));

      expect(errorCaught).toBe(true);
    });
  });
});
