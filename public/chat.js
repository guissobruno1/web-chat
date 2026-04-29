(function () {
  const config = window.chatConfig || {};
  const nomeEmpresa = config.nomeEmpresa || 'Suporte';
  const corPrimaria = config.corPrimaria || '#0ea5e9';
  const mensagemBoasVindas = config.mensagemBoasVindas || 'Posso te ajudar? 😊';
  const API_URL = '/v1/message';

  let sessionId = localStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('chat_session_id', sessionId);
  }

  const style = document.createElement('style');
  style.textContent = `
    /* === Animações === */
    @keyframes chatSlideUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes chatPulse {
      0%, 100% { box-shadow: 0 2px 8px rgba(0,0,0,0.2), 0 0 0 0 ${corPrimaria}55; }
      50%       { box-shadow: 0 2px 8px rgba(0,0,0,0.2), 0 0 0 10px ${corPrimaria}00; }
    }
    @keyframes chat-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }

    /* === Chat box === */
    #chat-box {
      position: fixed; bottom: 24px; right: 24px;
      width: 340px; background: white; border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      z-index: 9999; display: none; flex-direction: column;
      overflow: hidden; font-family: sans-serif;
    }
    #chat-box.chat-open {
      animation: chatSlideUp 0.25s ease;
    }

    /* === Header === */
    #chat-header {
      background: ${corPrimaria}; color: white;
      padding: 16px; font-weight: bold; font-size: 15px;
      display: flex; align-items: center; gap: 10px;
    }
    #chat-fechar {
      margin-left: auto; cursor: pointer;
      font-size: 18px; opacity: 0.8;
      -webkit-user-select: none; user-select: none;
    }
    #chat-fechar:hover { opacity: 1; }
    #chat-header .status-dot {
      width: 10px; height: 10px; border-radius: 50%; background: #4cff72;
    }

    /* === Mensagens === */
    #chat-messages {
      padding: 16px; min-height: 200px; max-height: 320px;
      overflow-y: auto; display: flex; flex-direction: column; gap: 10px;
    }
    .msg-bot, .msg-cliente, .msg-erro {
      padding: 10px 14px; border-radius: 12px;
      max-width: 85%; font-size: 14px; line-height: 1.5;
    }
    .msg-bot  { background: #f0f0f0; align-self: flex-start; }
    .msg-cliente { background: ${corPrimaria}; color: white; align-self: flex-end; }
    .msg-erro {
      background: #fee2e2; color: #b91c1c;
      border-left: 3px solid #ef4444; align-self: flex-start;
    }
    .msg-time {
      display: block; font-size: 10px; opacity: 0.5; margin-top: 4px; text-align: right;
    }
    .msg-bot .msg-time, .msg-erro .msg-time { text-align: left; }

    /* === Typing === */
    .typing {
      display: flex; gap: 4px; padding: 10px 14px;
      background: #f0f0f0; border-radius: 12px;
      align-self: flex-start; width: fit-content;
    }
    .typing span {
      width: 8px; height: 8px; border-radius: 50%;
      background: #999; animation: chat-bounce 1.2s infinite;
    }
    .typing span:nth-child(2) { animation-delay: 0.2s; }
    .typing span:nth-child(3) { animation-delay: 0.4s; }

    /* === Input === */
    #chat-input-area {
      display: flex; padding: 12px; border-top: 1px solid #eee; gap: 8px;
    }
    #chat-input {
      flex: 1; padding: 8px 12px; border-radius: 20px;
      border: 1px solid #ddd; font-size: 14px; outline: none;
    }
    #chat-input:focus { border-color: ${corPrimaria}; }
    #chat-send {
      background: ${corPrimaria}; color: white; border: none;
      border-radius: 50%; min-width: 38px; width: 38px; height: 38px;
      cursor: pointer; font-size: 16px; transition: background 0.2s;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    #chat-send:disabled { opacity: 0.5; cursor: default; }

    /* === Notificação === */
    #chat-notificacao {
      position: fixed; bottom: 32px; right: 105px;
      background: white; border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      padding: 12px 28px 12px 16px; max-width: 220px;
      font-size: 14px; line-height: 1.5;
      font-family: sans-serif; cursor: pointer;
      z-index: 9998;
      -webkit-user-select: none; user-select: none;
    }
    #chat-notificacao::after {
      content: ''; position: absolute;
      bottom: 12px; right: -8px;
      border-width: 8px 0 8px 8px;
      border-style: solid;
      border-color: transparent transparent transparent white;
    }
    #chat-notif-fechar {
      position: absolute; top: 6px; right: 8px;
      font-size: 11px; opacity: 0.4; cursor: pointer; line-height: 1;
    }
    #chat-notif-fechar:hover { opacity: 0.9; }

    /* === Avatar === */
    #chat-avatar {
      position: fixed; bottom: 24px; right: 24px;
      width: 65px; height: 65px; border-radius: 50%;
      overflow: visible; z-index: 9998; cursor: pointer;
      animation: chatPulse 2s infinite;
      -webkit-user-select: none; user-select: none;
    }
    #chat-avatar .avatar-initials {
      width: 65px; height: 65px; border-radius: 50%;
      background: ${corPrimaria}; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; font-weight: bold; font-family: sans-serif;
      letter-spacing: 1px;
    }
    #chat-avatar .avatar-dot {
      position: absolute; bottom: 2px; right: 2px;
      width: 12px; height: 12px; border-radius: 50%;
      background: #4cff72; border: 2px solid white;
    }
    #chat-avatar.hidden { display: none; }

    /* === Mobile === */
    @media (max-width: 480px) {
      #chat-box {
        width: 100vw; right: 0; bottom: 0;
        border-radius: 16px 16px 0 0;
      }
      #chat-avatar { bottom: 16px; right: 16px; }
      #chat-notificacao { right: 90px; max-width: 180px; }
    }
  `;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('beforeend', `
    <div id="chat-notificacao">
      ${mensagemBoasVindas}
      <span id="chat-notif-fechar">✕</span>
    </div>
    <div id="chat-avatar">
      <div class="avatar-initials">LS</div>
      <div class="avatar-dot"></div>
    </div>
    <div id="chat-box">
      <div id="chat-header">
        <div class="status-dot"></div>
        ${nomeEmpresa}
        <span id="chat-fechar">✕</span>
      </div>
      <div id="chat-messages"></div>
      <div id="chat-input-area">
        <input id="chat-input" type="text" placeholder="Digite sua mensagem..." />
        <button id="chat-send">&#x27A4;</button>
      </div>
    </div>
  `);

  const avatar = document.getElementById('chat-avatar');
  const box = document.getElementById('chat-box');
  const messages = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const notificacao = document.getElementById('chat-notificacao');
  let iniciado = false;

  function abrirChat() {
    notificacao.style.display = 'none';
    box.style.display = 'flex';
    box.classList.remove('chat-open');
    void box.offsetWidth; // força reflow para reiniciar animação
    box.classList.add('chat-open');
    avatar.classList.add('hidden');
    if (!iniciado) {
      iniciado = true;
      iniciarConversa();
    }
  }

  avatar.addEventListener('click', abrirChat);
  notificacao.addEventListener('click', abrirChat);

  document.getElementById('chat-notif-fechar').addEventListener('click', (e) => {
    e.stopPropagation();
    notificacao.style.display = 'none';
  });

  document.getElementById('chat-fechar').addEventListener('click', () => {
    box.style.display = 'none';
    box.classList.remove('chat-open');
    avatar.classList.remove('hidden');
    notificacao.style.display = 'block';
  });

  async function iniciarConversa() {
    setInputDisabled(true);
    mostrarTyping();
    await chamarAPI('Olá');
    setInputDisabled(false);
    input.focus();
  }

  async function enviarMensagem(texto) {
    if (!texto.trim() || input.disabled) return;
    adicionarMensagem('cliente', texto);
    input.value = '';
    setInputDisabled(true);
    mostrarTyping();
    await chamarAPI(texto);
    setInputDisabled(false);
    input.focus();
  }

  async function chamarAPI(mensagem) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: mensagem })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      removerTyping();

      if (data.status === 'error') {
        adicionarMensagem('erro', 'Ops! Ocorreu um erro interno. Tente novamente em instantes.');
        return;
      }

      adicionarMensagem('bot', data.response);

      if (data.status === 'collecting_info' && data.profile?.name && !data.profile?.phone) {
        aplicarMascaraTelefone();
      } else {
        resetarInput();
      }
    } catch (e) {
      removerTyping();
      adicionarMensagem('erro', 'Serviço temporariamente indisponível. Tente novamente em breve.');
    }
  }

  function aplicarMascaraTelefone() {
    input.placeholder = '(55) 99999-9999';
    input.maxLength = 15;
    input.addEventListener('input', mascaraTelefone);
  }

  function resetarInput() {
    input.placeholder = 'Digite sua mensagem...';
    input.maxLength = 524288;
    input.removeEventListener('input', mascaraTelefone);
  }

  function mascaraTelefone() {
    let v = input.value.replace(/\D/g, '');
    if (v.length <= 2) v = `(${v}`;
    else if (v.length <= 7) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    else if (v.length <= 11) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    else v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7,11)}`;
    input.value = v;
  }

  function setInputDisabled(disabled) {
    input.disabled = disabled;
    sendBtn.disabled = disabled;
  }

  function getTimestamp() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  function mostrarTyping() {
    if (!document.getElementById('typing-indicator')) {
      const div = document.createElement('div');
      div.id = 'typing-indicator';
      div.className = 'typing';
      div.innerHTML = '<span></span><span></span><span></span>';
      messages.appendChild(div);
      div.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }

  function removerTyping() {
    const t = document.getElementById('typing-indicator');
    if (t) t.remove();
  }

  function adicionarMensagem(origem, texto) {
    const div = document.createElement('div');
    div.className = `msg-${origem}`;
    div.appendChild(document.createTextNode(texto));
    const time = document.createElement('span');
    time.className = 'msg-time';
    time.textContent = getTimestamp();
    div.appendChild(time);
    messages.appendChild(div);
    div.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  sendBtn.addEventListener('click', () => enviarMensagem(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') enviarMensagem(input.value);
  });
})();
