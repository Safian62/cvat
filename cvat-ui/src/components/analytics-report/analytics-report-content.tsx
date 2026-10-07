// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useEffect, useRef, useState } from 'react';
import { Alert, Card, Empty, Select, Spin } from 'antd';
import { Chart } from 'chart.js/auto';

import { Project, Task, Job, ShapeType } from 'cvat-core-wrapper';
import { useSelector } from 'react-redux';
import config from 'config';
import { CombinedState } from 'reducers';
import PaidFeaturePlaceholder from 'components/paid-feature-placeholder/paid-feature-placeholder';
import { TimePeriod } from '.';

interface Props {
    resource: Project | Task | Job;
    timePeriod: TimePeriod | null;
}

interface AnnotationCount {
    label: string;
    count: number;
}

interface AnnotationStats {
    task_id: number;
    total: number;
    filter: {
        shape_type: string | null;
    };
    counts: AnnotationCount[];
}

function AnnotationAnalytics({ resource }: { resource: Task }): JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart | null>(null);

    const [stats, setStats] = useState<AnnotationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [shapeType, setShapeType] = useState<ShapeType | undefined>();

    useEffect(() => {
        let cancelled = false;

        async function fetchStats(): Promise<void> {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/api/test/tasks/${resource.id}/annotation-stats${shapeType ?
                        `?shape_type=${encodeURIComponent(shapeType)}` : ''}`,
                    {
                        method: 'GET',
                        credentials: 'include',
                    },
                );

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const data = await response.json() as AnnotationStats;

                if (!cancelled) {
                    setStats(data);
                }
            } catch (requestError: unknown) {
                if (!cancelled) {
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : 'Could not load annotation statistics.',
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchStats();

        return () => {
            cancelled = true;
        };
    }, [resource, shapeType]);

    useEffect(() => {
        if (loading || error || !canvasRef.current || !stats || !stats.counts.length) {
            return undefined;
        }

        chartRef.current?.destroy();

        chartRef.current = new Chart(canvasRef.current, {
            type: 'bar',
            data: {
                labels: stats.counts.map((item) => item.label),
                datasets: [{
                    label: 'Annotations',
                    data: stats.counts.map((item) => item.count),
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                        },
                    },
                },
            },
        });

        return () => {
            chartRef.current?.destroy();
            chartRef.current = null;
        };
    }, [stats, loading, error]);

    const shapeTypeFilter = (
        <Select
            allowClear
            placeholder='All shape types'
            style={{ width: 180 }}
            value={shapeType}
            onChange={(value: ShapeType | undefined) => setShapeType(value)}
        >
            {Object.values(ShapeType).map((type) => (
                <Select.Option key={type} value={type}>
                    {type[0].toUpperCase() + type.slice(1)}
                </Select.Option>
            ))}
        </Select>
    );

    if (loading) {
        return (
            <Card>
                <Spin tip='Loading annotation statistics...' />
            </Card>
        );
    }

    if (error) {
        return (
            <Alert
                type='error'
                message='Could not load annotation analytics'
                description={error}
            />
        );
    }

    if (!stats || stats.total === 0) {
        return (
            <Card
                title='Annotation Analytics'
                extra={shapeTypeFilter}
            >
                <Empty
                    description={shapeType ?
                        `No ${shapeType} annotations found for this task.` :
                        'No annotations found for this task.'}
                />
            </Card>
        );
    }

    return (
        <Card
            title='Annotation Analytics'
            extra={(
                <>
                    <span>Total annotations: {stats.total}</span>
                    <span style={{ marginLeft: 16 }}>{shapeTypeFilter}</span>
                </>
            )}
        >
            <div style={{ height: 360 }}>
                <canvas ref={canvasRef} />
            </div>
        </Card>
    );
}

function AnalyticsReportContentWrap(props: Readonly<Props>): JSX.Element {
    const overrides = useSelector(
        (state: CombinedState) => state.plugins.overridableComponents.analyticsReportPage.content,
    );

    if (props.resource instanceof Task) {
        return <AnnotationAnalytics resource={props.resource} />;
    }

    if (overrides.length) {
        const [Component] = overrides.slice(-1);
        return <Component {...props} />;
    }

    return (
        <PaidFeaturePlaceholder
            featureDescription={config.PAID_PLACEHOLDER_CONFIG.features.analyticsReport}
        />
    );
}

export default React.memo(AnalyticsReportContentWrap);
