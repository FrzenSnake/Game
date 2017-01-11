class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView: LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event: RES.ResourceEvent): void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event: RES.ResourceEvent): void {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event: RES.ResourceEvent): void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private textfield: egret.TextField;
    public static interval;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene(): void {
        var scene = new GameScene();
        this.addChild(scene);


        var grid = new Grid(10, 10, scene);
        var astar: Astar = new Astar(grid);

        var standdata = RES.getRes("stand_json");
        var standtxtr = RES.getRes("stand_png");
        var stand_mcFactory: egret.MovieClipDataFactory = new egret.MovieClipDataFactory(standdata, standtxtr);
        var playerstand_mc: egret.MovieClip = new egret.MovieClip(stand_mcFactory.generateMovieClipData("1"));

        var movedata = RES.getRes("run_json");
        var movetxtr = RES.getRes("run_png");
        var move_mcFactory: egret.MovieClipDataFactory = new egret.MovieClipDataFactory(movedata, movetxtr);
        var playermove_mc: egret.MovieClip = new egret.MovieClip(move_mcFactory.generateMovieClipData("2"));

        var PlayerContainer = new egret.DisplayObjectContainer();
        //  this.addChild(PlayerContainer);
        PlayerContainer.addChild(playerstand_mc);
        PlayerContainer.addChild(playermove_mc);
        playermove_mc.gotoAndPlay(1, -1);
        playerstand_mc.gotoAndPlay(1, -1);
        playerstand_mc.alpha = 0;
        playermove_mc.alpha = 0;

        var m: StateMachine = new StateMachine(scene, playerstand_mc, playermove_mc, PlayerContainer);







        scene.addChild(PlayerContainer);
        GameScene.replaceScene(scene);

        scene.addEventListener(egret.TouchEvent.TOUCH_TAP, (e) => {

            if (true) {
                var list = new CommandList();
                list.addCommand(new WalkCommand(e.stageX / grid.Size, e.stageY / grid.Size, m, PlayerContainer, grid));
                list.execute();
            }
        }, this);

        var taskScene = new egret.DisplayObjectContainer();
        this.addChild(taskScene);
        var taskService: TaskService = TaskService.getInstance();
        var sceneService: SceneService = SceneService.getInstance();

        var emoji_1: egret.Bitmap = this.createBitmapByName("have_jpg");
        var emoji_2: egret.Bitmap = this.createBitmapByName("complete_png");
        var emoji_3: egret.Bitmap = this.createBitmapByName("have_jpg");
        var picture_1: egret.Bitmap = this.createBitmapByName("Exia_png");
        var picture_2: egret.Bitmap = this.createBitmapByName("Dark_png");
        var picture_3: egret.Bitmap = this.createBitmapByName("Kill_png");

        var mockKillMonsterButton = new MockKillMonsterButton(m, PlayerContainer, grid);
        taskScene.addChild(mockKillMonsterButton);
        mockKillMonsterButton.x = 600;
        mockKillMonsterButton.y = 550;

        var dialoguePanel = new DialoguePanel();
        taskScene.addChild(dialoguePanel);

        var NPC_1: NPC = new NPC(picture_1, emoji_1, "npc_0", dialoguePanel, mockKillMonsterButton, m, PlayerContainer, grid);
        NPC_1.x = 400;
        NPC_1.y = 500;
        taskScene.addChild(NPC_1);

        var NPC_2: NPC = new NPC(picture_2, emoji_2, "npc_1", dialoguePanel, mockKillMonsterButton, m, PlayerContainer, grid);
        NPC_2.x = 900;
        NPC_2.y = 800;
        taskScene.addChild(NPC_2);

        var NPC_3: NPC = new NPC(picture_3, emoji_3, "npc_2", dialoguePanel, mockKillMonsterButton, m, PlayerContainer, grid);
        NPC_3.x = 600;
        NPC_3.y = 200;
        taskScene.addChild(NPC_3);

        var npcTalkTaskCondition = new NpcTalkTaskCondition();
        var killMonsterTaskCondition = new KillMonsterTaskCondition();

        var task: Task = new Task("1", "task1", TaskStatus.ACCEPTABLE, -1, 0, npcTalkTaskCondition);
        var taskPanel = new TaskPanel();
        taskScene.addChild(taskPanel);

        var task2: Task = new Task("2", "task2", TaskStatus.ACCEPTABLE, -1, 5, killMonsterTaskCondition);

        taskService.observerList.push(NPC_1);
        taskService.observerList.push(NPC_2);
        taskService.observerList.push(taskPanel);
        taskService.taskList.push(task);

        sceneService.observerList.push(killMonsterTaskCondition);
        sceneService.observerList.push(NPC_3);
        sceneService.taskList.push(task2);

        taskService.notify();
        sceneService.notify();



        //UserPanel
        var eightGod: egret.Bitmap = this.createBitmapByName("freedom_png");
        //  this.addChild(captain);
        var timg: egret.Bitmap = this.createBitmapByName("lightgun_png");
        timg.y = 230;
        // this.addChild(timg);

        var jewels: Jewel[] = [];
        var jewel1: Jewel = new Jewel(1, 2.8);
        jewels.push(jewel1);

        var equipments: Equipment[] = [];
        var equipment1: Equipment = new Equipment(1, Rare.传说, jewels);
        equipments.push(equipment1);

        var heroes: Hero[] = [];
        var hero1: Hero = new Hero(true, 50, 1, Rare.传说, equipments);

        //  hero1.properties.all.push(property);
        heroes.push(hero1);

        var panel = new Panel(heroes);
        //  this.addChild(panel);

        var user: User = new User(100, 100, 50, 100, 1, heroes);

        console.log(user.fightPower);

        var userPanelButton: egret.TextField = new egret.TextField();
        userPanelButton.touchEnabled = true;
        this.addChild(userPanelButton);
        userPanelButton.$setText("属性面板");
        userPanelButton.textColor = 0xffffff;
        userPanelButton.x = 500;
        userPanelButton.y = 950;
        userPanelButton.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            if (userPanel.alpha == 0) {
                userPanel.alpha = 1;
            } else {
                userPanel.alpha = 0;
            }
        }, this);

        var userPanel = new egret.DisplayObjectContainer();
        userPanel.alpha = 0;
        var background: egret.Bitmap = this.createBitmapByName("userPanel_jpg");
        userPanel.addChild(background);
        userPanel.addChild(panel);
        userPanel.addChild(eightGod);
        userPanel.addChild(timg);

        this.addChild(userPanel);

    }



    private createBitmapByName(name: string): egret.Bitmap {
        var result = new egret.Bitmap();
        var texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

}










