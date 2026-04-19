using System;

namespace FinanceKite.API.Controllers;

using FinanceKite.Application.Features.RecurringInvoices;
using Microsoft.AspNetCore.Mvc;

[Route("api/businesses/{businessId:guid}/recurring-invoices")]
public class RecurringInvoicesController(RecurringInvoiceService recurringInvoiceService) : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetAll(Guid businessId, CancellationToken cancellationToken)
    {
        var result = await recurringInvoiceService.GetAllAsync(businessId, CurrentUserId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid businessId, Guid id, CancellationToken cancellationToken)
    {
        var result = await recurringInvoiceService.GetByIdAsync(id, businessId, CurrentUserId, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        Guid businessId,
        [FromBody] CreateRecurringInvoiceRequest request,
        CancellationToken cancellationToken)
    {
        var result = await recurringInvoiceService.CreateAsync(businessId, CurrentUserId, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { businessId, id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid businessId,
        Guid id,
        [FromBody] UpdateRecurringInvoiceRequest request,
        CancellationToken cancellationToken)
    {
        var result = await recurringInvoiceService.UpdateAsync(id, businessId, CurrentUserId, request, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid businessId, Guid id, CancellationToken cancellationToken)
    {
        await recurringInvoiceService.DeleteAsync(id, businessId, CurrentUserId, cancellationToken);
        return NoContent();
    }
}
