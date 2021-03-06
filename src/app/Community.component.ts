import { Component, OnInit, ViewChildren } from "@angular/core";
import { FormControl } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";

interface Result {
  Average: number;
  Day: number;
  Bill: number;
  Class: number;
}

@Component({
  selector: "",
  templateUrl: "./Community.component.html",
  styleUrls: ["./Community.component.css"]
})
export class Community implements OnInit {
  @ViewChildren("month") Months_Input;

  constructor(private sanitizer: DomSanitizer) {}
  Santize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  test() {
    const url = ((url: any) => {
      const { Mode, dong, floor, month } = this.Form;
      const searchParams = {
        dong: dong,
        month: month
      };
      if (Mode === "User") searchParams["floor"] = floor;

      url = new URL(url);
      Object.keys(searchParams).forEach(key =>
        url.searchParams.append(key, searchParams[key])
      );

      return url.toString();
    })("https://apigateway.hwangsehyun.ga/community");
    console.log(url);

    fetch(url)
      .then(res => {
        if (res.status === 200) return res.text();
        throw new Error(res.statusText);
      })
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
        var { Average, Day } = data;
        const Ratio = Average / Day / 30 / 14;
        var Class: number;

        console.log({ Ratio });
        if (Ratio < 0.) Class = 1;
        else if (Ratio < 0.9) Class = 2;
        else if (Ratio < 1.) Class = 3;
        else if (Ratio < 1.2) Class = 4;
        else Class = 5;

        function Bill(x) {
          var bill = 0;
          const UnitCost = [93.3, 187.9, 280.6];
          const DefaultCost = [910, 1600, 7300];

          return Math.round(
            (() => {
              if (x < 200) return DefaultCost[0] + x * UnitCost[0];
              else bill += 200 * UnitCost[0];

              if (x < 400)
                return DefaultCost[1] + bill + (x - 200) * UnitCost[1];
              else bill += 200 * UnitCost[1];

              return DefaultCost[2] + bill + (x - 400) * UnitCost[2];
            })()
          );
        }

        this.Result = {
          Average: Math.round(Average),
          Day: Math.round(Day),
          Class: Math.round(Class),
          Bill: Bill(Day * 30)
        };

        console.log(this.Result);
      })
      .catch(console.warn);
  }

  Tab = new FormControl(1);
  ngOnInit() {
    this.Tab.valueChanges.subscribe(value => {
      this.Form.Unit = ["d", "m"][this.Tab.value];
      this.Submit();
    });
  }

  Months() {
    var string = "";
    this.Months_Input.forEach(x => (string += x.value + "-"));
    this.Form.month = string.slice(0, -1);
    this.Submit();
  }

  Result: Result;
  src: string;
  Stringify = JSON.stringify;

  Submit() {
    console.log(this.Form);
  }

  Form_Initial = {
    dong: Array.from({ length: 7 }, (x, i) => i + 101),
    floor: Array.from({ length: 10 }, (x, i) => i + 1)
  };
  Form = {
    Mode: "User",
    Unit: "d",
    dong: 101,
    floor: 2,
    month: "1-12"
  };

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
