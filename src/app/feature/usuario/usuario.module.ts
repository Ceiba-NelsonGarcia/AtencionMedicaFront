import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListarUsuariosComponent } from './components/listar-usuarios/listar-usuarios.component';
import { EliminarUsuarioComponent } from './components/eliminar-usuario/eliminar-usuario.component';
import { ActualizarUsuarioComponent } from './components/actualizar-usuario/actualizar-usuario.component';
import { UsuarioRoutingModule } from './usuario-routing.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsuarioService } from './Shared/service/usuario.service';
import { CrearUsuarioComponent } from './components/crear-usuario/crear-usuario.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ListarUsuariosComponent,
    EliminarUsuarioComponent,
    ActualizarUsuarioComponent,
    CrearUsuarioComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    UsuarioRoutingModule,
    ReactiveFormsModule,
  ],
  providers: [UsuarioService]
})
export class UsuarioModule { }
