import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import {Client, Transaction} from '../../../modeles/Transaction';

@Component({
  selector: 'app-depot',
  templateUrl: './depot.page.html',
  styleUrls: ['./depot.page.scss'],
})
export class DepotPage implements OnInit {
  myTransaction: Transaction;
  etape = true;
  credentials: FormGroup;
  frais: any;
  montantTotal: any;
  montantSend: any;
  avatar: string;
  constructor( private fb: FormBuilder,
               private toastrCtl: ToastController,
               public alertCtrl: AlertController,
               private loadingCtrl: LoadingController,
               private authService: AuthenticationService) {
    this.myTransaction = {} as Transaction;
    this.myTransaction.clientenvoi = {} as Client;
    this.myTransaction.clientRetrait = {} as Client;
  }

  ngOnInit() {
    this.credentials = this.fb.group({
      montant: [ [Validators.required, Validators.min(500)]],
      total: [[Validators.min(500)]],
      clientenvoi:this.fb.group( {
        cni: ['234567891234', [Validators.required, Validators.minLength(8)]],
        prenom: ['Jeynaba', [Validators.required, Validators.minLength(2)]],
        nom: ['FAYE', [Validators.required, Validators.minLength(2)]],
        telephone: ['777603468', [Validators.required, Validators.minLength(9)]],
      }),
      clientRetrait:this.fb.group( {
        cni: ['2154852154662', [Validators.required, Validators.minLength(8)]],
        prenom: ['Moussa2', [Validators.required, Validators.minLength(2)]],
        nom: ['Dabo', [Validators.required, Validators.minLength(2)]],
        telephone: ['775509444', [Validators.required, Validators.minLength(9)]],
      }),
    });


  }

  async Create() {
  if(this.credentials.value.montant >=500) {
    this.myTransaction.montant = this.credentials.value.montant;
    this.myTransaction.type = "depot";
    this.myTransaction.status = true;
    this.myTransaction.clientenvoi = this.credentials.value.clientenvoi;
    this.myTransaction.clientRetrait = this.credentials.value.clientRetrait;
    let Infos = {
      emetteur: this.myTransaction.clientenvoi.prenom + " " + this.myTransaction.clientenvoi.nom,
      telephone: this.myTransaction.clientenvoi.telephone,
      cni: this.myTransaction.clientenvoi.cni,
      montant: this.myTransaction.montant,
      recepteur: this.myTransaction.clientRetrait.prenom + " " + this.myTransaction.clientRetrait.nom,
      telephoneRep: this.myTransaction.clientRetrait.telephone
    }
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Confirmation',
      message: `<div class="affiche">
                Emetteur  <br> <p>${Infos?.emetteur}</p> <br>
                Téléphone  <br><p>${Infos?.telephone}</p><br>
                N CNI  <br><p>${Infos?.cni}</p><br>
                Récepteur  <br><p>${Infos?.recepteur}</p><br>
                Montant  <br><p>${Infos?.montant}</p> <br>
                Téléphone  <br><p>${Infos?.telephoneRep}</p><br>
        </div>`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: async () => {
            const loading = await this.loadingCtrl.create();
            await loading.present();
            this.authService.Transaction(this.myTransaction).subscribe(
              async (data) => {
                const result = data.data;
                await loading.dismiss();
                this.credentials.reset();
                const alert = await this.alertCtrl.create({
                  header: 'Transfert réussi',
                  message: `<ion-card>
                            <ion-item >
                            <ion-label class="ion-text-wrap">
                                 Vous avez envoyé ${result.montant} à  ${result.clientRetrait.nom} le ${result.dateEnvoi}
                             </ion-label>
                            </ion-item>
                              <ion-item>
                               <ion-label>Code de transaction</ion-label>
                              </ion-item>
                              <ion-item>${result.code} </ion-item>
                            </ion-card-content>
                          </ion-card>`,

                  buttons: [{
                    text: 'Retour',
                    role: 'cancel',
                    cssClass: 'doNotPrint',
                    handler: () => {

                    }
                  },
                    {
                      text: 'imprimer',
                      cssClass: 'doNotPrint',
                      handler: () => {
                        window.print();
                      }
                    }]
                });
                await alert.present();
              }, async (error) => {
                console.log(error);

                await loading.dismiss();
                const alert = await this.alertCtrl.create({
                  header: 'Failed',
                  cssClass: "my-custom-class-error",
                  message: error.error,
                  buttons: ['OK']
                });
                await alert.present();
              })
          }
        }
      ]
    });

    await alert.present();
  }else{
    const alert = await this.alertCtrl.create({
      header: 'Failed',
      cssClass: "my-custom-class-error",
      message: "le montant doit être supérieur ou égal à 500f",
      buttons: ['OK']
    });
    await alert.present();
  }
  }
 //#region parti navigation
  previous(){
    this.etape = true;
  }
  next(){
    this.etape = false;
  }
//#endregion
  async calculFrais(event: KeyboardEvent) {
     if(this.credentials.value.montant == 0 || this.credentials.value.montant == null){
       this.frais = '';
       this.montantTotal = ''
     }else {
        this.authService.calculator(this.credentials.value).subscribe(
         async (data) => {
           this.frais = data.data;
           this.montantTotal = data.data + this.credentials.value.montant;
         }, async (error) => {
         })
     }
  }

  //#region parti des getters
  get montant() {
    return this.credentials.get('montant');
  }
  get prenom() {
    return this.credentials.get('clientenvoi').get('prenom');
  }
  get nom() {
    return this.credentials.get('clientenvoi').get('nom');
  }
  get telephone() {
    return this.credentials.get('clientenvoi').get('telephone');
  }

  get cni() {
    return this.credentials.get('clientenvoi').get('cni');
  }
  get prenom1() {
    return this.credentials.get('clientRetrait').get('prenom');
  }
  get nom1() {
    return this.credentials.get('clientRetrait').get('nom');
  }
  get telephone1() {
    return this.credentials.get('clientRetrait').get('telephone');
  }
//#endregion


  calculTotal(event: KeyboardEvent) {
    if(this.credentials.value.total == 0 || this.credentials.value.total < 500 || this.credentials.value.total == null){
      this.frais = '';
      this.montantSend = '';
    }else {
      this.authService.deCalculator(this.credentials.value).subscribe(
        async (res) => {
          this.frais = res.data.frais;
          this.montantSend = res.data.montantSend;
        }, async (error) => {
        })
    }
  }
}
