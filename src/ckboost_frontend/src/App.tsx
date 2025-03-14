import { useState, FormEvent, ChangeEvent } from 'react';
import { ckboost_backend } from '../../declarations/ckboost_backend';


function App(): JSX.Element {
  const [greeting, setGreeting] = useState<string>('');
  const [name, setName] = useState<string>('');

  function handleNameChange(event: ChangeEvent<HTMLInputElement>): void {
    setName(event.target.value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<boolean> {
    event.preventDefault();
    
    try {
      const result = await ckboost_backend.greet(name);
      setGreeting(result);
    } catch (error) {
      console.error('Error calling the backend:', error);
    }
    
    return false;
  }

  return (
    <main>
      <img src="/logo2.svg" alt="DFINITY logo" />
      <br />
      <br />
      <form action="#" onSubmit={handleSubmit}>
        <label htmlFor="name">Enter your name: &nbsp;</label>
        <input 
          id="name" 
          alt="Name" 
          type="text" 
          value={name}
          onChange={handleNameChange}
        />
        <button type="submit">Click Me!</button>
      </form>
      <section id="greeting">{greeting}</section>
    </main>
  );
}

export default App; 