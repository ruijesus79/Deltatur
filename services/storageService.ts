// Serviço de Armazenamento Persistente de Grande Capacidade (IndexedDB)
// Permite guardar imagens e documentos sem os limites de 5MB do LocalStorage

const DB_NAME = 'DeltaturMediaDB';
const DB_VERSION = 1;
const STORES = {
  GALLERY: 'gallery',
  DOCUMENTS: 'documents',
  KNOWLEDGE_BASE: 'knowledgeBase'
};

// Helper para abrir a BD
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject('Erro ao abrir DB');

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Criar stores se não existirem
      if (!db.objectStoreNames.contains(STORES.GALLERY)) {
        db.createObjectStore(STORES.GALLERY, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.DOCUMENTS)) {
        db.createObjectStore(STORES.DOCUMENTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.KNOWLEDGE_BASE)) {
        db.createObjectStore(STORES.KNOWLEDGE_BASE, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
  });
};

// Guardar lista completa (limpa e reescreve para manter sincronia com o estado React)
export const saveCollection = async (storeName: string, items: any[]) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    // Limpar store antiga
    await new Promise<void>((resolve, reject) => {
        const clearReq = store.clear();
        clearReq.onsuccess = () => resolve();
        clearReq.onerror = () => reject();
    });

    // Adicionar novos items
    items.forEach(item => store.add(item));

    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject('Erro na transação');
    });
  } catch (error) {
    console.error(`Erro ao guardar em ${storeName}:`, error);
  }
};

// Carregar lista completa
export const loadCollection = async (storeName: string): Promise<any[]> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject('Erro ao ler dados');
    });
  } catch (error) {
    console.error(`Erro ao carregar de ${storeName}:`, error);
    return [];
  }
};

// --- API Específica para a App ---

export const mediaDB = {
  gallery: {
    save: (items: any[]) => saveCollection(STORES.GALLERY, items),
    load: () => loadCollection(STORES.GALLERY)
  },
  documents: {
    save: (items: any[]) => saveCollection(STORES.DOCUMENTS, items),
    load: () => loadCollection(STORES.DOCUMENTS)
  },
  knowledgeBase: {
    save: (items: any[]) => saveCollection(STORES.KNOWLEDGE_BASE, items),
    load: () => loadCollection(STORES.KNOWLEDGE_BASE)
  }
};