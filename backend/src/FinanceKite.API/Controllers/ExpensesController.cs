using System;

namespace FinanceKite.API.Controllers;

using FinanceKite.Application.Features.Expenses;
using Microsoft.AspNetCore.Mvc;

[Route("api/businesses/{businessId:guid}/expenses")]
public class ExpensesController(ExpenseService expenseService) : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetAll(Guid businessId, CancellationToken cancellationToken)
    {
        var result = await expenseService.GetAllAsync(businessId, CurrentUserId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid businessId, Guid id, CancellationToken cancellationToken)
    {
        var result = await expenseService.GetByIdAsync(id, businessId, CurrentUserId, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        Guid businessId,
        [FromBody] CreateExpenseRequest request,
        CancellationToken cancellationToken)
    {
        var result = await expenseService.CreateAsync(businessId, CurrentUserId, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { businessId, id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid businessId,
        Guid id,
        [FromBody] UpdateExpenseRequest request,
        CancellationToken cancellationToken)
    {
        var result = await expenseService.UpdateAsync(id, businessId, CurrentUserId, request, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/upload-proof")]
    public async Task<IActionResult> UploadProofOfPayment(
        Guid businessId,
        Guid id,
        IFormFile file,
        CancellationToken cancellationToken)
    {
        var result = await expenseService.UploadProofOfPaymentAsync(id, businessId, CurrentUserId, file, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid businessId, Guid id, CancellationToken cancellationToken)
    {
        await expenseService.DeleteAsync(id, businessId, CurrentUserId, cancellationToken);
        return NoContent();
    }

    [HttpGet("{id:guid}/proof-url")]
    public async Task<IActionResult> GetProofUrl(
    Guid businessId,
    Guid id,
    [FromQuery] bool download = false,
    CancellationToken cancellationToken = default)
    {
        var url = await expenseService.GetProofOfPaymentUrlAsync(
            id, businessId, CurrentUserId, cancellationToken);

        return Ok(new { url, download });
    }

    [HttpDelete("{id:guid}/proof")]
    public async Task<IActionResult> DeleteProof(
    Guid businessId,
    Guid id,
    CancellationToken cancellationToken)
    {
        await expenseService.DeleteProofOfPaymentAsync(id, businessId, CurrentUserId, cancellationToken);
        return NoContent();
    }
}
