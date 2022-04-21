import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ListarUsuariosComponent } from './components/listar-usuarios/listar-usuarios.component';
import { CrearUsuariosComponent } from './components/crear-usuarios/crear-usuarios.component';

const routes: Routes = [
  { path: 'listar-usuarios', component: ListarUsuariosComponent },
  { path: 'crear-usuario', component: CrearUsuariosComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuarioRoutingModule {}
