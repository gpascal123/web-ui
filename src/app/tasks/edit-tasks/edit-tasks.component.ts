import { TitleComponent, TitleComponentOption, ToolboxComponent, ToolboxComponentOption, TooltipComponent, TooltipComponentOption, GridComponent, GridComponentOption, VisualMapComponent, VisualMapComponentOption, DataZoomComponent, DataZoomComponentOption, MarkLineComponent, MarkLineComponentOption } from 'echarts/components';
import { faHomeAlt, faEye, faEraser } from '@fortawesome/free-solid-svg-icons';
import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { environment } from './../../../environments/environment';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LineChart, LineSeriesOption } from 'echarts/charts';
import { FormControl, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Observable, Subject } from 'rxjs';
import * as echarts from 'echarts/core';

import { PendingChangesGuard } from 'src/app/core/_guards/pendingchanges.guard';
import { UIConfigService } from 'src/app/core/_services/shared/storage.service';
import { GlobalService } from 'src/app/core/_services/main.service';
import { colorpicker } from '../../core/_constants/settings.config';
import { PageTitle } from 'src/app/core/_decorators/autotitle';
import { SERV } from '../../core/_services/main.config';

@Component({
  selector: 'app-edit-tasks',
  templateUrl: './edit-tasks.component.html'
})
@PageTitle(['Edit Task'])
export class EditTasksComponent implements OnInit,PendingChangesGuard {

  editMode = false;
  editedTaskIndex: number;
  editedTask: any // Change to Model

  faEraser=faEraser;
  faHome=faHomeAlt;
  faEye=faEye;

  constructor(
    private uiService:UIConfigService,
    private route: ActivatedRoute,
    private gs: GlobalService,
    private router: Router
  ) { }

  updateForm: FormGroup;
  color = '';
  colorpicker=colorpicker;
  private maxResults = environment.config.prodApiMaxResults;

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};
  uidateformat:any;
  crackerinfo:any;
  getchunks: any;

  ngOnInit() {

    this.setAccessPermissions();

    this.uidateformat = this.uiService.getUIsettings('timefmt').value;

    this.route.params
    .subscribe(
      (params: Params) => {
        this.editedTaskIndex = +params['id'];
        this.editMode = params['id'] != null;
        this.initForm();
        this.assignChunksInit(this.editedTaskIndex);
      }
    );

    this.updateForm = new FormGroup({
      'taskId': new FormControl({value: '', disabled: true}),
      'forcePipe': new FormControl({value: '', disabled: true}),
      'skipKeyspace': new FormControl({value: '', disabled: true}),
      'keyspace': new FormControl({value: '', disabled: true}),
      'keyspaceProgress': new FormControl({value: '', disabled: true}),
      'crackerBinaryId': new FormControl({value: '', disabled: true}),
      'chunkSize': new FormControl({value: '', disabled: true}),
      'updateData': new FormGroup({
        'taskName': new FormControl(''),
        'attackCmd': new FormControl(''),
        'notes': new FormControl(''),
        'color': new FormControl(''),
        'chunkTime': new FormControl(''),
        'statusTimer': new FormControl(''),
        'priority': new FormControl(''),
        'maxAgents': new FormControl(''),
        'isCpuTask': new FormControl(''),
        'isSmall': new FormControl(''),
      }),
    });

    this.getTaskSpeed();

  }

  // Set permissions
  manageTaskAccess: any;

  setAccessPermissions(){
    this.gs.get(SERV.USERS,this.gs.userId,{'expand':'globalPermissionGroup'}).subscribe((perm: any) => {
        this.manageTaskAccess = perm.globalPermissionGroup.permissions.manageTaskAccess;
    });
  }

  OnChangeValue(value){
    this.updateForm.patchValue({
      updateData:{color: value}
    });
  }

  onSubmit(){
    if(this.manageTaskAccess || typeof this.manageTaskAccess == 'undefined'){
    if (this.updateForm.valid) {

      this.gs.update(SERV.TASKS,this.editedTaskIndex,this.updateForm.value['updateData']).subscribe(() => {
          Swal.fire({
            title: "Success",
            text: "Task updated!",
            icon: "success",
            showConfirmButton: false,
            timer: 1500
          });
          this.updateForm.reset(); // success, we reset form
          this.router.navigate(['tasks/show-tasks']);
        }
      );
    }
    }else{
      Swal.fire({
        title: "ACTION DENIED",
        text: "Please contact your Administrator.",
        icon: "error",
        showConfirmButton: false,
        timer: 2000
      })
    }
  }

  private initForm() {
    if (this.editMode) {
    this.gs.get(SERV.TASKS,this.editedTaskIndex).subscribe((result)=>{
      this.color = result['color'];
      this.gs.get(SERV.CRACKERS,result['crackerBinaryId']).subscribe((val) => {
        this.crackerinfo = val;
      });
      this.getHashlist();
      this.tkeyspace = result['keyspace'];
      this.tusepreprocessor = result['preprocessorId'];
      this.updateForm = new FormGroup({
        'taskId': new FormControl(result['taskId']),
        'forcePipe': new FormControl({value: result['forcePipe']== true? 'Yes':'No', disabled: true}),
        'skipKeyspace': new FormControl({value: result['skipKeyspace'] > 0?result['skipKeyspace']:'N/A', disabled: true}),
        'keyspace': new FormControl({value: result['keyspace'], disabled: true}),
        'keyspaceProgress': new FormControl({value: result['keyspaceProgress'], disabled: true}),
        'crackerBinaryId': new FormControl(result['crackerBinaryId']),
        'chunkSize': new FormControl({value: result['chunkSize'], disabled: true}),
        'updateData': new FormGroup({
          'taskName': new FormControl(result['taskName']),
          'attackCmd': new FormControl(result['attackCmd']),
          'notes': new FormControl(result['notes']),
          'color': new FormControl(result['color']),
          'chunkTime': new FormControl(Number(result['chunkTime'])),
          'statusTimer': new FormControl(result['statusTimer']),
          'priority': new FormControl(result['priority']),
          'maxAgents': new FormControl(result['maxAgents']),
          'isCpuTask': new FormControl(result['isCpuTask']),
          'isSmall': new FormControl(result['isSmall']),
        }),
      });
    });
   }
  }


  attachFilesInit(id: number){
    this.dtOptions[0] = {
      dom: 'Bfrtip',
      scrollY: "700px",
      scrollCollapse: true,
      paging: false,
      autoWidth: false,
      buttons: {
          dom: {
            button: {
              className: 'dt-button buttons-collection btn btn-sm-dt btn-outline-gray-600-dt',
            }
          },
      buttons:[]
      }
    }
  }

  assingAgentInit(id: number){
    this.dtOptions[1] = {
      dom: 'Bfrtip',
      scrollY: "700px",
      scrollCollapse: true,
      paging: false,
      destroy: true,
      buttons: {
          dom: {
            button: {
              className: 'dt-button buttons-collection btn btn-sm-dt btn-outline-gray-600-dt',
            }
          },
      buttons:[]
      }
    }
  }

/**
 * This function calculates Keyspace searched, Time Spent and Estimated Time
 *
**/
  // Keyspace searched
  cprogress: any;
  tkeyspace: any;
  tusepreprocessor: any;
  // Time Spent
  ctimespent: any;
  timeCalc(chunks){
      const cprogress = [];
      const timespent = [];
      const current = 0;
      for(let i=0; i < chunks.length; i++){
        cprogress.push(chunks[i].checkpoint - chunks[i].skip);
        if(chunks[i].dispatchTime > current){
          timespent.push(chunks[i].solveTime - chunks[i].dispatchTime);
        } else if (chunks[i].solveTime > current) {
          timespent.push(chunks[i].solveTime- current);
        }
      }
      this.cprogress = cprogress.reduce((a, i) => a + i);
      this.ctimespent = timespent.reduce((a, i) => a + i);
  }

  // Chunk View
  chunkview: number;
  isactive = 0;
  currenspeed = 0;
  chunkresults: Object;
  activechunks: Object;

  assignChunksInit(id: number){
    this.route.data.subscribe(data => {
      switch (data['kind']) {

        case 'edit-task':
          this.chunkview = 0;
          this.chunkresults = this.maxResults;
        break;

        case 'edit-task-c100':
          this.chunkview = 1;
          this.chunkresults = 100;
        break;

        case 'edit-task-cAll':
          this.chunkview = 2;
          this.chunkresults = 6000;
        break;

      }
    });
    const params = {'maxResults': this.chunkresults};
    this.gs.getAll(SERV.CHUNKS,params).subscribe((result: any)=>{
      const getchunks = result.values.filter(u=> u.taskId == id);
      this.timeCalc(getchunks);
      this.gs.getAll(SERV.AGENTS,params).subscribe((agents: any) => {
      this.getchunks = getchunks.map(mainObject => {
        const matchObject = agents.values.find(element => element.agentId === mainObject.agentId)
        return { ...mainObject, ...matchObject }
        })
      if(this.chunkview == 0){
        const chunktime = this.uiService.getUIsettings('chunktime').value;
        const resultArray = [];
        const cspeed = [];
        for(let i=0; i < this.getchunks.length; i++){
          if(Date.now()/1000 - Math.max(this.getchunks[i].solveTime, this.getchunks[i].dispatchTime) < chunktime && this.getchunks[i].progress < 10000){
            this.isactive = 1;

            cspeed.push(this.getchunks[i].speed);
            resultArray.push(this.getchunks[i]);
          }
        }
        this.currenspeed = cspeed.reduce((a, i) => a + i);
        this.getchunks = resultArray;
      }
      this.dtTrigger.next(void 0);
      });
    });

    this.dtOptions = {
      dom: 'Bfrtip',
      scrollY: "700px",
      scrollCollapse: true,
      paging: false,
      destroy: true,
      buttons: {
          dom: {
            button: {
              className: 'dt-button buttons-collection btn btn-sm-dt btn-outline-gray-600-dt',
            }
          },
      buttons:[]
      }
    }
  }

/**
 * This function reset information in the selected chunk, sets to zero; Dispatch Time, Solve Time, Progress and State
 *
**/
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      setTimeout(() => {
        this.dtTrigger['new'].next();
      });
    });
  }

  onReset(id: number){
    const reset = {'dispatchTime':0, 'solveTime':0, 'progress':0,'state':0};
    this.gs.update(SERV.CHUNKS,id, reset).subscribe(()=>{
      Swal.fire({
        title: "Chunk Reset!",
        icon: "success",
        showConfirmButton: false,
        timer: 1500
      });
      this.ngOnInit();
      this.rerender();
    });
  }
// Get HashList Information
hashL: any;

getHashlist(){
  const params = {'maxResults': this.maxResults, 'expand': 'hashlist', 'filter': 'taskId='+this.editedTaskIndex+''}
  const paramsh = {'maxResults': this.maxResults};
  const matchObject =[]
  this.gs.getAll(SERV.TASKS,params).subscribe((tasks: any) => {
    this.gs.getAll(SERV.HASHTYPES,paramsh).subscribe((htypes: any) => {
      this.hashL = tasks.values.map(mainObject => {
        matchObject.push(htypes.values.find((element:any) => element.hashTypeId === mainObject.hashlist.hashTypeId))
      return { ...mainObject, ...matchObject }
      })
    })
  })
}

// Task Speed Graph
getTaskSpeed(){
  this.editedTaskIndex;
  const params = {'maxResults': 3000 };

  this.gs.getAll(SERV.SPEEDS,params).subscribe((sp: any) => {
    this.initTaskSpeed(sp.values);
  });
}

initTaskSpeed(obj: object){

  echarts.use([
    TitleComponent,
    ToolboxComponent,
    TooltipComponent,
    GridComponent,
    VisualMapComponent,
    DataZoomComponent,
    MarkLineComponent,
    LineChart,
    CanvasRenderer,
    UniversalTransition
  ]);

  type EChartsOption = echarts.ComposeOption<
    | TitleComponentOption
    | ToolboxComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | VisualMapComponentOption
    | DataZoomComponentOption
    | MarkLineComponentOption
    | LineSeriesOption
  >;

  const data:any = obj;
  const arr = [];
  const max = []
  for(let i=0; i < data.length; i++){

    const iso = this.transDate(data[i]['time']);
    arr.push([iso, data[i]['speed']]);
    max.push(data[i]['time']);
  }

  const startdate =  Math.max(...max);
  const datelabel = this.transDate(startdate);
  const xAxis = this.generateIntervalsOf(5,+startdate-3000,+startdate);

  const chartDom = document.getElementById('tspeed');
  const myChart = echarts.init(chartDom);
  let option: EChartsOption;

  const self = this;

   option = {
        title: {
          subtext: 'Last record: '+datelabel,
        },
        tooltip: {
          position: 'top',
          formatter: function (p) {
            return p.data[0] + ': ' + p.data[1] + ' H/s';
          }
        },
        grid: {
          right: '0%',
        },
        xAxis: {
          data: xAxis.map(function (item: any[] | any) {
            return self.transDate(item);
          })
        },
        yAxis: {
          type: 'value',
          name: 'H/s',
          position: 'left',
          alignTicks: true,
        },
        useUTC: true,
        toolbox: {
          itemGap: 10,
          show: true,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {
              name: "Task Speed"
            }
          }
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            start: 94,
            end: 100,
            handleSize: 8
          },
          {
            type: 'inside',
            start: 94,
            end: 100
          },
        ],
        series: {
          name: '',
          type: 'line',
          data: arr,
          markLine: {
            silent: true,
            lineStyle: {
              color: '#333'
            },
            data: [
              {
                yAxis: 50
              },
              {
                yAxis: 100
              },
              {
                yAxis: 150
              },
              {
                yAxis: 200
              },
              {
                yAxis: 300
              }
            ]
          }
          }
        };
    option && myChart.setOption(option);
 }

 leading_zeros(dt){
  return (dt < 10 ? '0' : '') + dt;
 }

 transDate(dt){
  const date:any = new Date(dt* 1000);
  // American Format
  // return date.getUTCFullYear()+'-'+this.leading_zeros((date.getUTCMonth() + 1))+'-'+date.getUTCDate()+','+this.leading_zeros(date.getUTCHours())+':'+this.leading_zeros(date.getUTCMinutes())+':'+this.leading_zeros(date.getUTCSeconds());
  return date.getUTCDate()+'-'+this.leading_zeros((date.getUTCMonth() + 1))+'-'+date.getUTCFullYear()+','+this.leading_zeros(date.getUTCHours())+':'+this.leading_zeros(date.getUTCMinutes())+':'+this.leading_zeros(date.getUTCSeconds());
 }

 generateIntervalsOf(interval, start, end) {
    const result = [];
    let current = start;

    while (current < end) {
      result.push(current);
      current += interval;
    }

    return result;
  }

 // @HostListener allows us to also guard against browser refresh, close, etc.
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (!this.canDeactivate()) {
        $event.returnValue = "IE and Edge Message";
    }
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.updateForm.valid) {
    return false;
    }
    return true;
  }

}
