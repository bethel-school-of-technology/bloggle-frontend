import { Component, OnInit, Input } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Login } from '../models/Login';
import { FormsModule, Validators } from '@angular/forms';
import { HttpService } from '../services/http.service'
import { CreateUser } from '../models/CreateUser';
import { Password } from '../models/Password';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  @Input() loginModel:Login = new Login;
  @Input() user:CreateUser = new CreateUser;
  @Input() pass:Password = new Password;
  maxWH:number = 250
  minWH:number = 150 
  //base64textString:string = null

  constructor( private cookieService: CookieService, private _http: HttpService ) { }

  ngOnInit() {
    //try{
    //  this._http.checkToken().subscribe(data=>console.log(data.status))
    //  console.log("fail")
    //}catch{
    //  console.log("try")
    //}
  }

  onUploadChange(evt: any) {
    const file = evt.target.files[0];

    if (file) {

      const reader = new FileReader();
      let img = new Image();

      img.src = window.URL.createObjectURL( file );
      reader.readAsDataURL(file);
        
      setTimeout(() => {
          
        const width = img.naturalWidth;
        const height = img.naturalHeight;
      
        window.URL.revokeObjectURL( img.src );
        console.log(width + '*' + height);
        if ( (width < this.minWH || width > this.maxWH) && (height < this.minWH || height > this.maxWH) ) {
          alert('photo should be between dimensions '+this.minWH+' x '+this.minWH+' and '+this.maxWH+' x '+this.maxWH);
          this.user.Img = null;
        }else{
          reader.onload = this.handleReaderLoaded.bind(this);
          reader.readAsBinaryString(file)
          
        }
      }, 2000);
      //let img = new Image();
      //img.src = window.URL.createObjectURL( file );
      //const reader = new FileReader();
      //reader.onload = this.handleReaderLoaded.bind(this);
      //reader.readAsBinaryString(file);
    }
  }

  handleReaderLoaded(e) {
    this.user.Img = 'data:image/png;base64,' + btoa(e.target.result);
  }

  passwordCheck() {

    var confirmation:boolean[] = [false,false,false]

    if(this.pass.Pass != this.pass.ConfirmPass){
      return "The Confirmation Password does not match the initial Password."
    }else{
      let functionPassword = this.pass.Pass;

      if (functionPassword.length <= 8 || functionPassword.length >= 20) {
        return "Password length must be between 8 and 20 characters."
      }else{
        let i = 0
        while(i < functionPassword.length){
          let asciiVal = functionPassword.charCodeAt(i) //grabbing the ascii value of each character

          if(48 <= asciiVal && 57 >= asciiVal){ //confirm if password has a number
            confirmation[0] = true
          }
          else if(65 <= asciiVal && 90 >= asciiVal){ //confirm if password has an uppercase
            confirmation[1] = true
          }
          else if(97 <= asciiVal && 122 >= asciiVal){ //confirm if password has a lowercase
            confirmation[2] = true
          }if(confirmation[0] == true && confirmation[1] == true && confirmation[2] == true){
            return null;
          }
          i++
        }
        return "Your password is missing either a number, captial letter, or lowercase letter"
      }
    }
  }
  
  addUser(){
    console.log(this.user.Img)
    var response = this.passwordCheck()
    if(response != null){
      return alert(response)
    }
    else{
      this.user.Password = this.pass.Pass
      this._http.createUser(this.user).subscribe(data=>alert(data.response + ", please login"))
    }
  }

  login(){
    this._http.getToken(this.loginModel).subscribe(data=>{
      if(data.token == ""){
        alert(data.response);
      }else{
        console.log(data.token)
        this.createCookie(data.token)
        window.location.replace('/');
      }
    })
  }

  createCookie(token:string){
    this.cookieService.set('Token', token );
  }
}