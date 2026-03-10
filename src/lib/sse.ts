// SSE connection manager for lobbies and games

type LobbyConnection = { write: (data: string) => void };

const lobbyConnections = new Map<string, Set<LobbyConnection>>();

export function addLobbyListener(
  lobbyId: string,
  conn: LobbyConnection,
): () => void {
  if (!lobbyConnections.has(lobbyId)) {
    lobbyConnections.set(lobbyId, new Set());
  }
  lobbyConnections.get(lobbyId)!.add(conn);
  return () => {
    lobbyConnections.get(lobbyId)?.delete(conn);
    if (lobbyConnections.get(lobbyId)?.size === 0) {
      lobbyConnections.delete(lobbyId);
    }
  };
}

export function broadcastToLobby(lobbyId: string, data: unknown): void {
  const set = lobbyConnections.get(lobbyId);
  if (!set) return;
  const msg = typeof data === "string" ? data : JSON.stringify(data);
  set.forEach((conn) => {
    try {
      conn.write(msg);
    } catch {
      // connection may be dead
    }
  });
}

type GameConnection = { write: (data: string) => void };

const gameConnections = new Map<string, Set<GameConnection>>();

export function addGameListener(
  gameId: string,
  conn: GameConnection,
): () => void {
  if (!gameConnections.has(gameId)) {
    gameConnections.set(gameId, new Set());
  }
  gameConnections.get(gameId)!.add(conn);
  return () => {
    gameConnections.get(gameId)?.delete(conn);
    if (gameConnections.get(gameId)?.size === 0) {
      gameConnections.delete(gameId);
    }
  };
}

export function broadcastToGame(gameId: string, data: unknown): void {
  const set = gameConnections.get(gameId);
  if (!set) return;
  const msg = typeof data === "string" ? data : JSON.stringify(data);
  set.forEach((conn) => {
    try {
      conn.write(msg);
    } catch {
      // connection may be dead
    }
  });
}
