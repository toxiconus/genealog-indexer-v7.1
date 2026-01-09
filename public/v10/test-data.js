// test-data.js - Dane testowe dla thumbs
export const testActs = [
  {
    id: 'act-001',
    type: 'chrzest',
    year: 1890,
    nr: 1,
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="140"%3E%3Crect fill="%23444" width="100" height="140"/%3E%3Ctext x="50" y="70" text-anchor="middle" fill="%23fff" font-size="12"%3ECHRZ.%3C/text%3E%3Ctext x="50" y="90" text-anchor="middle" fill="%23aaa" font-size="10"%3E1890%3C/text%3E%3C/svg%3E',
    data: {
      childName: 'Test Child 1',
      fatherName: 'Test Father 1',
      motherName: 'Test Mother 1'
    }
  },
  {
    id: 'act-002',
    type: 'malzenstwo',
    year: 1880,
    nr: 5,
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="140"%3E%3Crect fill="%23334455" width="100" height="140"/%3E%3Ctext x="50" y="70" text-anchor="middle" fill="%23fff" font-size="12"%3EMALZ.%3C/text%3E%3Ctext x="50" y="90" text-anchor="middle" fill="%23aaa" font-size="10"%3E1880%3C/text%3E%3C/svg%3E',
    data: {
      groomName: 'Test Groom 1',
      brideName: 'Test Bride 1'
    }
  },
  {
    id: 'act-003',
    type: 'zgon',
    year: 1895,
    nr: 12,
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="140"%3E%3Crect fill="%23553333" width="100" height="140"/%3E%3Ctext x="50" y="70" text-anchor="middle" fill="%23fff" font-size="12"%3EZGON%3C/text%3E%3Ctext x="50" y="90" text-anchor="middle" fill="%23aaa" font-size="10"%3E1895%3C/text%3E%3C/svg%3E',
    data: {
      deceasedName: 'Test Deceased 1',
      age: 65
    }
  }
];

// Ładowanie danych testowych do localStorage
export function loadTestData() {
  const data = {
    imageActs: testActs,
    currentEventId: 'act-001',
    currentTemplate: 'chrzest'
  };
  localStorage.setItem('actaData_v10', JSON.stringify(data));
  console.log('Test data loaded to localStorage');
  // Odśwież stronę
  location.reload();
}

// Czyszczenie localStorage
export function clearTestData() {
  localStorage.removeItem('actaData_v10');
  console.log('localStorage cleared');
  location.reload();
}

// Wyloguj dane z localStorage
export function logStorageData() {
  const data = localStorage.getItem('actaData_v10');
  if (data) {
    console.log('Storage data:', JSON.parse(data));
  } else {
    console.log('No data in localStorage');
  }
}

// Udostępnij funkcje w konsoli
window.testData = {
  load: loadTestData,
  clear: clearTestData,
  log: logStorageData
};
