import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SecurityGuard } from '@core/guard/security.guard';
import { HomeComponent } from '@home/home.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [SecurityGuard]  },
  { path: 'usuario', loadChildren: () => import('./feature/usuario/usuario.module').then(mod => mod.UsuarioModule) },
  { path: 'doctor', loadChildren: () => import('./feature/doctor/doctor.module').then(mod => mod.DoctorModule) },
  { path: 'cita', loadChildren: () => import('./feature/cita/cita.module').then(mod => mod.CitaModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
