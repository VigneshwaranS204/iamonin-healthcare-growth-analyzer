import { OpportunityItem } from '../opportunity/opportunityEngine.js';
import { TechnicalFindingItem } from '../analyzer/technicalSeoAnalyzer.js';
import { FullAuditReportData } from '../report/reportGenerator.js';

export class ExportService {
  /**
   * Formats audit opportunities and findings as CSV string.
   */
  generateCsv(
    hospitalName: string,
    websiteUrl: string,
    opportunities: OpportunityItem[],
    technicalFindings: TechnicalFindingItem[]
  ): string {
    const rows: string[] = [];

    // Header
    rows.push('Type,Hospital,Website,Category,Title/Check,Severity/Priority,Impact,Effort,Evidence,Recommendation,IAMONIN Module');

    // Opportunities
    for (const opp of opportunities) {
      rows.push(
        [
          'Opportunity',
          this.escapeCsv(hospitalName),
          this.escapeCsv(websiteUrl),
          this.escapeCsv(opp.category),
          this.escapeCsv(opp.title),
          this.escapeCsv(opp.severity),
          this.escapeCsv(opp.impact),
          this.escapeCsv(opp.effort),
          this.escapeCsv(opp.evidence),
          this.escapeCsv(opp.recommendedAction),
          this.escapeCsv(opp.iamoninModuleLabel),
        ].join(',')
      );
    }

    // Technical Findings
    for (const tf of technicalFindings) {
      rows.push(
        [
          'Technical Check',
          this.escapeCsv(hospitalName),
          this.escapeCsv(websiteUrl),
          this.escapeCsv(tf.category),
          this.escapeCsv(tf.name),
          this.escapeCsv(tf.severity),
          tf.passed ? 'PASSED' : 'ACTION REQUIRED',
          'N/A',
          this.escapeCsv(tf.evidence),
          this.escapeCsv(tf.recommendation),
          '01 Digital Foundation',
        ].join(',')
      );
    }

    return rows.join('\n');
  }

  /**
   * Formats entire report dataset as structured JSON.
   */
  generateJson(reportData: FullAuditReportData): string {
    return JSON.stringify(reportData, null, 2);
  }

  private escapeCsv(field?: string | number | null): string {
    if (field === undefined || field === null) return '""';
    const str = String(field).replace(/"/g, '""');
    return `"${str}"`;
  }
}
