import { Component, OnDestroy } from "@angular/core";
import { FormControl } from "@angular/forms";
import { IOInjectable, Timestamp, Parser, StatusInterface } from "./PnID";

@Component({
  selector: "",
  templateUrl: "./PnID.component.html",
  styleUrls: ["./PnID.component.css"],
  providers: [IOInjectable]
})
export class PnID {
  Log = console.log;
  table: Object;
  displayedColumns: string[] = ["time", "event"];
  Timestamp = Timestamp;

  Switches: boolean[];
  Tags: {
    TAG_NAME: string;
  }[];
  Status: StatusInterface;
  get StatusArray() {
    return Object.keys(this.Status);
  }
  StatusToggle(Tag) {
    this.Status[Tag] ^= 1;
    console.log(this.Status);
  }

  constructor(private io: IOInjectable) {
    console.time("Constructor");

    const Reduce = Key => (data: any[]): any =>
      data.reduce(
        (accum, cur) => {
          accum[cur[Key]] = cur;
          return accum;
        },
        {} as any
      );
    
    const Once = ()=>new Promise(resolve => ["on", "off"].map(x=>
      this.io[x]("Init", resolve)));
      const once = Once();
const Fetch = fetch("https://plantasset.kr/MPIS_WCF/webservice.asmx/TAG_SECH_LIST?area=");
    Promise.race([
       once,
   Fetch
    ]).then(data=>{
      data instanceof Response? {...data, once}: 
      Promise.race([Once(), Fetch ])
    })
    .then(console.log)
      .then(async ({ data, Status, Tags }) => {
        this.Status = Status.reduce(
          (accum, cur) => {
            accum[cur[0].trim()] = 1;
            return accum;
          },
          {} as StatusInterface
        );

        return {
          Tags: Reduce("tag")(Tags), 
          data: await Parser(data),
         };
      })
      .then(({data, Tags }) => {
        this.Tags = data.reduce((accum, cur) => {
          cur.TAG_NAME in Tags ? accum.unshift(cur) : accum.push(cur);
          return accum;
        }, []);
        console.timeEnd("Constructor");
      });
    this.io.on("AngularTable", data => (this.table = data));
    this.io.on("Switches", data => (this.Switches = data));
  }

  myControl = new FormControl();
  test() {
    this.io.emit("Ping");
  }

  ngOnDestroy() {
    this.io.close();
  }
}
