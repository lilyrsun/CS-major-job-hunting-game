interface StateConfig {
    name?: string;
    onEnter?: () => void;
    onUpdate?: (dt: number) => void;
    onExit?: () => void;
}

let idCount = 0;

export default class StateMachine {
    private id = (++idCount).toString();
    private context?: any;
    private name: string;
    private states = new Map<string, StateConfig>();

    private previousState?: StateConfig;
    private currentState?: StateConfig;
    private isSwitchingState = false;
    private stateQueue: string[] = [];

    get previousStateName() {
        if(!this.previousState) {
            return '';
        }  
        return this.previousState.name;
    }

    constructor(context?: any, name?: string) {
        this.context = context;
        this.name = name ?? 'machine';
    }

    isCurrentState(name: string) {
        if(!this.currentState) {
            return false;
        }

        return this.currentState.name === name;
    }

    addState(name: string, config: StateConfig) {
        this.states.set(name, {
            name,
            onEnter: config.onEnter?.bind(this.context),
            onUpdate: config.onUpdate?.bind(this.context),
            onExit: config.onExit?.bind(this.context)
        })

        return this;
    }

    setState(name: string) {
        if(!this.states.has(name)) {
            console.warn(`[State Machine (${this.name})] state ${name} not found`);
            return;
        }

        if(this.isCurrentState(name)) {
            return;
        }

        if(this.isSwitchingState) {
            this.stateQueue.push(name);
            return;
        }

        this.isSwitchingState = true;
        console.log(`[State Machine (${this.name})] change from ${this.currentState?.name ?? 'none'} to ${name}`);

        if(this.currentState && this.currentState.onExit) {
            this.currentState.onExit();
        }
        
        this.previousState = this.currentState;
        this.currentState = this.states.get(name)!;

        if(this.currentState.onEnter) {
            this.currentState.onEnter();
        }

        this.isSwitchingState = false;

        return this;
    }

    update(dt: number) {
        if(this.stateQueue.length > 0) {
            const name = this.stateQueue.shift()!;
            this.setState(name);
            return;
        }

        if(!this.currentState) {
            return;
        }

        if(this.currentState.onUpdate) {
            this.currentState.onUpdate(dt);
        }
    }
}