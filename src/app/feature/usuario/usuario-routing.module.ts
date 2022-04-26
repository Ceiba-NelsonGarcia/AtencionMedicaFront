import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ListarUsuariosComponent } from './components/listar-usuarios/listar-usuarios.component';
import { CrearUsuarioComponent } from './components/crear-usuario/crear-usuario.component';
import { EliminarUsuarioComponent } from './components/eliminar-usuario/eliminar-usuario.component';
import { ActualizarUsuarioComponent } from './components/actualizar-usuario/actualizar-usuario.component';

const routes: Routes = [
  { path: 'usuario/listar', component: ListarUsuariosComponent},
  { path: 'usuario/crear', component: CrearUsuarioComponent},
  { path: 'usuario/actualizar', component: ActualizarUsuarioComponent},
  { path: 'usuario/eliminar', component: EliminarUsuarioComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuarioRoutingModule {}
