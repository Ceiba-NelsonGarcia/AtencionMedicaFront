export class Usuario{

  idUsuario: number;
  nombreUsuario: string;

  constructor(idUsuario: number, nombreUsuario: string){
    this.idUsuario = idUsuario;
    this.nombreUsuario = nombreUsuario;
  }
}

export interface CrearUsuarioDTO extends Omit<Usuario, 'idUsuario'>{
  nombreUsuario: string;
}
