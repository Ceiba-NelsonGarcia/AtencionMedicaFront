export class Cita{

  idCita: number;
  idUsuario: number;
  idDoctor: number;
  fechaCita: string;
  horaInicial: number;
  horaFinal: number;
  valorUsd: number;
  valorCop: number;

  // tslint:disable-next-line:max-line-length
  constructor(idCita: number, idUsuario: number, idDoctor: number, fechaCita: string, horaInicial: number, horaFinal: number, valorUsd: number, valorCop: number) {
    this.idCita = idCita;
    this.idUsuario = idUsuario;
    this.idDoctor = idDoctor;
    this.fechaCita = fechaCita;
    this.horaInicial = horaInicial;
    this.horaFinal = horaFinal;
    this.valorUsd = valorUsd;
    this.valorCop = valorCop;
  }
}

export  interface CitaDTO extends Omit<Cita, 'idCita'>{
  idUsuario: number;
  idDoctor: number;
  fechaCita: string;
  horaInicial: number;
  horaFinal: number;
  valorUsd: number;
  valorCop: number;
}
