export class Doctor{

  idDoctor: number;
  nombreDoctor: string;
  idTarifa: number;
  idHorario: number;


  constructor(idDoctor: number, nombreDoctor: string, idTarifa: number, idHorario: number) {
    this.idDoctor = idDoctor;
    this.nombreDoctor = nombreDoctor;
    this.idTarifa = idTarifa;
    this.idHorario = idHorario;
  }
}

export interface DoctorDTO extends Omit<Doctor, 'idDoctor'>{
  nombreDoctor: string;
  idTarifa: number;
  idHorario: number;
}
