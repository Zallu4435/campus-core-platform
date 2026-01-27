import httpClient from '../../frameworks/api/httpClient';

class UniversitySessionService {
  async getSessions(params = {}) {
    const response = await httpClient.get('/faculty/sessions/university/sessions', { params });
    const data = response.data.data;
    if (data && data.sessions) {
      data.sessions = data.sessions.map((s: any) => {
        const id = s.id || s._id;
        return {
          ...s,
          id: id,
          _id: id
        };
      });
    }
    return data;
  }

  async joinSession(sessionId: string, userId: string) {
    const response = await httpClient.post(`/faculty/sessions/${sessionId}/join`, { userId });
    return response.data;
  }
}

export const universitySessionService = new UniversitySessionService(); 