import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'sdlc', name: 'pr_validation' })
export class PrValidationModel {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', length: 60, nullable: true })
  repository_name?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reviewer?: string | null;

  @Column({ type: 'varchar', length: 25, nullable: true })
  publisher?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  origin_branch?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  target_branch?: string;

  @Column({ type: 'boolean', nullable: true })
  merged?: boolean | null;

  @Column({ type: 'timestamp', nullable: true })
  validation_created_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  pr_created_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  pr_reviewed_at?: Date | null;

  @Column({ type: 'integer', nullable: true })
  standard_score?: number;

  @Column({ type: 'integer', nullable: true })
  standard_total?: number;

  @Column({ type: 'float', nullable: true })
  standard_percentage?: number;

  @Column({ type: 'integer', nullable: true })
  standard_score_pr ?: number | null;

  @Column({ type: 'integer', nullable: true })
  standard_total_pr ?: number | null;

  @Column({ type: 'float', nullable: true })
  standard_percentage_pr ?: number | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  technology?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  p_language?: string;

  @Column({ type: 'integer', nullable: true })
  pr_number?: number;

  @Column({ type: 'text', nullable: true })
  pr_comment?: string | null;

  @Column({ nullable: true })
  doc_synchronized?: boolean;

  @Column({ nullable: true })
  unit_test_executed?: boolean;

  @Column({ nullable: true })
  unit_test_score?: number;
}

