import { DocsModal } from './components/DocsModal';
import { Header } from './components/Header';
import { JsonModal } from './components/JsonModal';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { Viewport } from './components/Viewport';
import { FacadeProvider } from './context/FacadeContext';

export function App() {
  return (
    <FacadeProvider>
      <div className="app-shell">
        <Header />
        <div className="workspace">
          <Sidebar />
          <Viewport />
        </div>
      </div>
      <JsonModal />
      <DocsModal />
      <Toast />
    </FacadeProvider>
  );
}

export default App;
