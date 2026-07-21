import axios from "axios";

export default interface HttpClient {
  get(url: string): Promise<any>;
  post(url: string, body: any, headers: any): Promise<any>;
}

export class AxiosAdapter implements HttpClient {
  async get(url: string): Promise<any> {
    const response = await axios.get(url);
    return response.data;
  }

  async post(url: string, body: any, headers: any): Promise<any> {
    const response = await axios({
      url,
      method: "POST",
      data: body,
      headers: headers,
    });
    return response.data;
  }
}

export class FetchAdapter implements HttpClient {
  async get(url: string): Promise<any> {
    const response = await fetch(url);
    return response.json();
  }

  async post(url: string, body: any, headers: any): Promise<any> {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });
    return response.json();
  }
}
