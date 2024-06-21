class AuthService {
  private static TOKEN_KEY = 'sunat_client';

  async login(nrodoc: string, password: string, empresaId: string): Promise<string> {
    try {
      // Lógica para autenticar al usuario y obtener el token desde el servidor

      // const Url = "http://192.168.30.199:8080/apiguias/Login";
      // const dato = { nrodoc, password,empresa:empresaId };
  
      // //console.log(dato);
      // const requestapi = {
      //   method: "POST",
      //   header: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(dato),
      // };
      nrodoc=nrodoc
    password=password

      const token = await this.getTokenForEmpresa(empresaId);

      // Guardar el token en el almacenamiento local
      localStorage.setItem(AuthService.TOKEN_KEY, token);

      return token;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw new Error('Error al iniciar sesión');
    }
  }

  private async getTokenForEmpresa(empresaId: string): Promise<string> {
    // Lógica para obtener el token dependiendo del ID de la empresa (puede ser una llamada al servidor)
    // ...

    const url =`http://192.168.30.199:8080/apiguias/gettoken/newtoken/${empresaId}`;

    const response = await fetch(url);
    return response.json();

    // Ejemplo: Retornar un token de prueba con el ID de la empresa concatenado
    // return `token_${empresaId}`;
  }

  async renewToken(): Promise<string> {
    // Lógica para renovar el token (puede ser una llamada al servidor)
    // ...

    // Ejemplo: Retornar un token de prueba renovado
    return 'token_renewed';
  }

  logout(): void {
    localStorage.removeItem(AuthService.TOKEN_KEY);
  }

  // Resto del código...
}

export default new AuthService();