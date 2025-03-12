export interface IDepartmentEmployee {
    emp_no: number;
    dept_no: string;
    from_date: string | Date; // Date 타입도 허용하도록 수정
    to_date: string | Date; // Date 타입도 허용하도록 수정
}