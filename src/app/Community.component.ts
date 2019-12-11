import { Component, OnInit, ViewChildren } from "@angular/core";
import { FormControl } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "",
  templateUrl: "./Community.component.html",
  styleUrls: ["./Community.component.css"]
})
export class Community implements OnInit {
  @ViewChildren("month") Months_Input;
  constructor(private sanitizer: DomSanitizer) {}
  public Santize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  test() {
    const url = new URL("https://apigateway.hwangsehyun.ga/community/aaa");
    const searchParams = {
      dong: "102",
      floor: "3-8",
      month: "5-8"
    };
    Object.keys(searchParams).forEach(key =>
      url.searchParams.append(key, searchParams[key])
    );

    //fetch(url.toString())

    fetch(
      "https://apigateway.hwangsehyun.ga/community/aaa?dong=102&floor=3-8&month=5-8"
    )
      .catch(console.warn)
      .then(data => data.text())
      .then(text => {
        const LastLine = text.lastIndexOf("\n");
        this.src = URL.createObjectURL(
          new Blob([text.slice(0, LastLine)], { type: "image/svg+xml" })
        );

        return new DOMParser()
          .parseFromString(text.slice(LastLine, text.length), "text/xml")
          .querySelector("json").innerHTML;
      })
      .then(JSON.parse)
      .then(data => {
        console.log(data);
      });
  }

  Form_Initial = {
    dong: Array.from({ length: 7 }, (x, i) => i + 101),
    floor: Array.from({ length: 10 }, (x, i) => i + 1)
  };

  Tab = new FormControl(1);
  Months() {
    var string = "";
    this.Months_Input.forEach(x => (string += x.value + "-"));
    this.Form.month = string.slice(0, -1);
    this.Submit();
  }

  src: string;
  data: object;
  ngOnInit() {
    this.Tab.valueChanges.subscribe(value => {
      this.Form.Unit = ["d", "m"][this.Tab.value];
      this.Submit();
    });
  }

  Form = {
    Mode: "User",
    Unit: "d",
    dong: 101,
    floor: 1,
    month: "1-12"
  };
  Stringify = JSON.stringify;
  Submit() {
    console.log(this.Form);
  }

  Devices = [
    {
      EN: "humidifier",
      KR: "가습기"
    },
    {
      EN: "light",
      KR: "무드등"
    }
  ];
}
