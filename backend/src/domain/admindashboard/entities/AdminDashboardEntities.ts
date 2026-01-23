// Domain entities for Admin Dashboard

export class DashboardMetrics {
    constructor(
        public readonly totalUsers: number,
        public readonly totalRevenue: number,
        public readonly activeCourses: number,
        public readonly pendingApprovals: number
    ) { }

    static create(props: {
        totalUsers: number;
        totalRevenue: number;
        activeCourses: number;
        pendingApprovals: number;
    }): DashboardMetrics {
        return new DashboardMetrics(
            props.totalUsers,
            props.totalRevenue,
            props.activeCourses,
            props.pendingApprovals
        );
    }

    toJSON() {
        return {
            totalUsers: this.totalUsers,
            totalRevenue: this.totalRevenue,
            activeCourses: this.activeCourses,
            pendingApprovals: this.pendingApprovals,
        };
    }
}

export class UserGrowthDataPoint {
    constructor(
        public readonly month: string,
        public readonly users: number,
        public readonly target: number
    ) { }

    static create(props: {
        month: string;
        users: number;
        target: number;
    }): UserGrowthDataPoint {
        return new UserGrowthDataPoint(props.month, props.users, props.target);
    }

    toJSON() {
        return {
            month: this.month,
            users: this.users,
            target: this.target,
        };
    }
}

export class RevenueDataPoint {
    constructor(
        public readonly month: string,
        public readonly tuition: number,
        public readonly fees: number,
        public readonly other: number
    ) { }

    static create(props: {
        month: string;
        tuition: number;
        fees: number;
        other: number;
    }): RevenueDataPoint {
        return new RevenueDataPoint(
            props.month,
            props.tuition,
            props.fees,
            props.other
        );
    }

    toJSON() {
        return {
            month: this.month,
            tuition: this.tuition,
            fees: this.fees,
            other: this.other,
        };
    }
}

export class PerformanceMetric {
    constructor(
        public readonly name: string,
        public readonly value: number,
        public readonly color: string
    ) { }

    static create(props: {
        name: string;
        value: number;
        color: string;
    }): PerformanceMetric {
        return new PerformanceMetric(props.name, props.value, props.color);
    }

    toJSON() {
        return {
            name: this.name,
            value: this.value,
            color: this.color,
        };
    }
}

export class ActivityItem {
    constructor(
        public readonly id: string,
        public readonly action: string,
        public readonly user: string,
        public readonly time: string,
        public readonly avatar: string,
        public readonly type: 'success' | 'warning' | 'info' | 'error',
        public readonly isRead: boolean
    ) { }

    static create(props: {
        id: string;
        action: string;
        user: string;
        time: string;
        avatar: string;
        type: 'success' | 'warning' | 'info' | 'error';
        isRead: boolean;
    }): ActivityItem {
        return new ActivityItem(
            props.id,
            props.action,
            props.user,
            props.time,
            props.avatar,
            props.type,
            props.isRead
        );
    }

    toJSON() {
        return {
            id: this.id,
            action: this.action,
            user: this.user,
            time: this.time,
            avatar: this.avatar,
            type: this.type,
            isRead: this.isRead,
        };
    }
}

export class SystemAlert {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly message: string,
        public readonly type: 'success' | 'warning' | 'error' | 'info',
        public readonly priority: 'low' | 'medium' | 'high',
        public readonly timestamp: string,
        public readonly isDismissed: boolean
    ) { }

    static create(props: {
        id: string;
        title: string;
        message: string;
        type: 'success' | 'warning' | 'error' | 'info';
        priority: 'low' | 'medium' | 'high';
        timestamp: string;
        isDismissed: boolean;
    }): SystemAlert {
        return new SystemAlert(
            props.id,
            props.title,
            props.message,
            props.type,
            props.priority,
            props.timestamp,
            props.isDismissed
        );
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            message: this.message,
            type: this.type,
            priority: this.priority,
            timestamp: this.timestamp,
            isDismissed: this.isDismissed,
        };
    }
}
